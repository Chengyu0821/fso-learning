
const Header = (props) => {
  console.log(props)
  return (
    <>
     <h1>{props.course}</h1>
    </>
  )
}

const Total = (props) => {
  console.log(props)
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
  const course = 'Half Stack application development Test Test'


  const part1 = 'Fundamentals of React'
  const exercises1 = 10
  const part2 = 'Using props to pass data'
  const exercises2 = 7
  const part3 = 'State of a component'
  const exercises3 = 14

  const parts = [
    { id: 1, name: part1, exercises: exercises1 },
    { id: 2, name: part2, exercises: exercises2 },
    { id: 3, name: part3, exercises: exercises3 },
  ]

  return (
    <div>
      <Header course={course} />
      <Content parts={parts} />
      <Total parts={parts} />
    </div>
  )
}

export default App