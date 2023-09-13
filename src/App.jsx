
/** @jsx h */
import {h, render, useEffect, useState} from "./index";
export const App = () => {
    const [counter, setCounter] = useState(1);
    const [counter1, setCounter1] = useState(5);

    const counterFn = () => {
        console.log('incrementing');
        setCounter(counter + 1)
    }

    useEffect(() => {
        setTimeout(() => {
            setCounter1(counter1 + 1);
        }, 2000)
    }, [counter])


    return (<div>
        <h1>Hello world</h1>
        <div>{`My number is ${counter} not ${counter1}`}</div>
        <button onClick={counterFn}>Click me</button>
        <button onClick={() => setCounter(1)}>haha</button>
    </div>)
}

render(<div><h1>hey</h1><h2>there</h2><App /></div>, document.body);