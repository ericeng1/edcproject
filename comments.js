import { supabase } from './supabaseClient.js';

let lastCommentTime = 0;
let currentOffset = 0;
const LIMIT = 5;

export async function loadComments(entityId, entityType, reset = true) {
  if (reset) {
    currentOffset = 0;
    document.getElementById('comment-list').innerHTML = '';
  }

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('entity_id', entityId)
    .eq('entity_type', entityType)
    .order('created_at', { ascending: false })
    .range(currentOffset, currentOffset + LIMIT - 1);

  if (error) {
    console.error(error);
    return;
  }

  const list = document.getElementById('comment-list');

  const { data: { user } } = await supabase.auth.getUser();

  data.forEach(comment => {
    const div = document.createElement('div');
    div.className = 'comment';

    const isOwner = user && user.id === comment.user_id;

    div.innerHTML = `
      <div class="comment-header">
        <span class="comment-user">${comment.user_id.slice(0,6)}</span>
        <span class="comment-date">${new Date(comment.created_at).toLocaleString()}</span>
        ${isOwner ? `<button class="comment-delete" data-id="${comment.id}">Delete</button>` : ''}
      </div>
      <div class="comment-content">${comment.content}</div>
    `;

    list.appendChild(div);
  });

  // Delete handlers
  document.querySelectorAll('.comment-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      await supabase.from('comments').delete().eq('id', id);
      loadComments(entityId, entityType, true);
    });
  });

  currentOffset += LIMIT;

  // Show/hide load more
  const loadMoreBtn = document.getElementById('load-more-comments');
  if (data.length === LIMIT) {
    loadMoreBtn.style.display = 'block';
  } else {
    loadMoreBtn.style.display = 'none';
  }
}

export async function submitComment(entityId, entityType) {
  const input = document.getElementById('comment-input');
  const content = input.value.trim();

  if (!content) return;

  // Character limit
  if (content.length > 140) {
    alert('Comment must be under 140 characters');
    return;
  }

  // Rate limit (30s)
  const now = Date.now();
  if (now - lastCommentTime < 30000) {
    alert('Please wait 30 seconds before posting again');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert('You must be logged in to comment');
    return;
  }

  const { error } = await supabase.from('comments').insert([
    {
      user_id: user.id,
      entity_id: entityId,
      entity_type: entityType,
      content
    }
  ]);

  if (error) {
    console.error(error);
    return;
  }

  lastCommentTime = now;
  input.value = '';

  loadComments(entityId, entityType, true);
}