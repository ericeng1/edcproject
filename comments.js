import { supabase } from './supabaseClient.js';

export async function loadComments(entityId, entityType) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('entity_id', entityId)
    .eq('entity_type', entityType)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading comments:', error);
    return;
  }

  const list = document.getElementById('comment-list');
  if (!list) return;

  list.innerHTML = '';

  data.forEach(comment => {
    const div = document.createElement('div');
    div.className = 'comment';

    div.innerHTML = `
      <div class="comment-content">${comment.content}</div>
      <div class="comment-date">
        ${new Date(comment.created_at).toLocaleString()}
      </div>
    `;

    list.appendChild(div);
  });
}

export async function submitComment(entityId, entityType) {
  const input = document.getElementById('comment-input');
  const content = input.value.trim();

  if (!content) return;

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
    console.error('Error posting comment:', error);
    return;
  }

  input.value = '';
  loadComments(entityId, entityType);
}