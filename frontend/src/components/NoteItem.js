const NoteItem = ({ note }) => (
  <div style={{ borderTop: "1px solid #ccc", padding: "8px 0" }}>
    <div>
      <strong>{new Date(note.created_at).toLocaleDateString()}</strong>
    </div>
    <div>{note.content}</div>
  </div>
);

export default NoteItem;
