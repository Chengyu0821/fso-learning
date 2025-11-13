export const Content = ({ parts }) => (
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