import { useState } from 'react'
import './App.css';

const StatisticLine = ({ text, value }) => {

  return ( 
          <tr>
            <td>{text} </td>
            <td>{value} </td>
          </tr>
      )
}


const Statistics = ({ good, neutral, bad }) => {
  // ⬇️ 在渲染阶段计算平均值
  const all = good + neutral + bad
  const average = all === 0 ? 0 : (good - bad) / all
  const positive = all === 0 ? '0%' : (good / all) * 100 + '%'

  return (all === 0) ? (
    <>
      <p>No feedback given</p>
    </>
  ) : (
    <table style={{ border: "0.1px solid black" }}>
      <StatisticLine text="good" value ={good} />
      <StatisticLine text="neutral" value ={neutral} />
      <StatisticLine text="bad" value ={bad} />
      <StatisticLine text="all" value ={all} />
      <StatisticLine text="average" value ={average} />
      <StatisticLine text="positive" value ={positive} />
    </table>
  )
}

const Button = ({ onClick, text }) => {
  return (<button onClick={onClick}>{text}</button>)
}

const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  const addGood = () => setGood(good + 1)
  const addBad = () => setBad(bad + 1)
  const addNeutral = () => setNeutral(neutral + 1)



  return (
    <div>
      <h1>give feedback</h1>
      <Button onClick={addGood} text='good'/>
      <Button onClick={addBad} text='bad'/>
      <Button onClick={addNeutral} text='neutral'/>
      <br />
      <h1>Statistics</h1>
      <br />
      <Statistics good={good} neutral={neutral} bad={bad}/>
      
    </div>
  )
}

export default App