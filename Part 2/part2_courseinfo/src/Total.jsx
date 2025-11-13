export const Total = ({ parts }) => {
    const total = parts.reduce((sum, part) => sum + part.exercises, 0)
    // array.reduce((累计值, 当前元素) => { ...return 新的累计值 }, 初始值)
    
    return (
      <>
      <p>Number of exercises {total}</p>
      </>
    )
    
  }