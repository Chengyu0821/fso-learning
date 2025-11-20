const Notification = ({ message}) => {
    if (message.message === null) {
      return null
    }
  
    return (
      <div className={message.isError ? "error" : "success"}>
        {message.message}
      </div>
    )
  }
  
  export default Notification

