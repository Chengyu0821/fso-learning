
const Header = (props) => {
  console.log(props)
  return (
    <>
     <h1>{props.course}</h1>
    </>
  )
}

const Total = ({ parts }) => {

  const total = parts.reduce((sum, part) => sum + part.exercises, 0)
  // array.reduce((累计值, 当前元素) => { ...return 新的累计值 }, 初始值)
  
  return (
    <>
    <p>Number of exercises {total}</p>
    </>
  )
  
  return (
    <>
    <p>Number of exercises {props.number}</p>
    </>
  )
}

const Content = ({ parts }) => (
  <div>
    {parts.map(p => (
      <Part key={p.id} name={p.name} exercises={p.exercises} />
    ))}
  </div>  
)

const Part = (props) => (
    <p>
      {props.name} {props.exercises}
    </p>
)



const App = () => {
  // const course = 'Half Stack application development Test Test'
  const course = {
    name: 'Half Stack application development',
    parts: [
      {
        name: 'Fundamentals of React',
        exercises: 10
      },
      {
        name: 'Using props to pass data',
        exercises: 7
      },
      {
        name: 'State of a component',
        exercises: 14
      }
    ]
  }

  return (
    <div>
      <Header course={course.name} />
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </div>
  )
}

export default App