const UploadDialog = ({ open, onOpenChange }) => {
  return (
    <div className={`dialog ${open ? 'open' : ''}`}>
      <h2>上传文本资料</h2>
      <input type="file" accept=".txt,.doc,.docx,.pdf" />
      <button onClick={onOpenChange}>上传</button>
    </div>
  )
}

export default UploadDialog