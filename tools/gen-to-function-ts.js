const range = []
for (let i = 0; i < 10; i++) {
    let types = (r) => range.map(j => `Arg${j}, `).join('') + r
    let argTypes = range.map(j => `arg${j}: Arg${j}`).join(', ')
    let args = range.map(j => `arg${j}`).join(', ')
    console.log(`
export type Function${i}<${types('Result')}> = (${argTypes}) => Result
export type ToFunction${i}<${types('Result')}> = ((${argTypes}) => Result) | Result
export function toFunction${i}<${types('Result')}> (toFunc: ToFunction${i}<${types('Result')}>): Function${i}<${types('Result')}> {
    if (typeof toFunc === 'function') {
        return toFunc
    }
    return (${argTypes}) => toFunc
}

export type AsyncFunction${i}<${types('Result')}> = (${argTypes}) => Promise<Result>
export type ToAsyncFunction${i}<${types('Result')}> = ToFunction${i}<${types('Promise<Result> | Result')}>
export function toAsyncFunction${i}<${types('Result')}> (toFunc: ToAsyncFunction${i}<${types('Result')}>): AsyncFunction${i}<${types('Result')}> {
    const func = toFunction${i}(toFunc)
    return (${argTypes}) => new Promise(resolve => resolve(func(${args})))
}
`)
    range.push(i)
}