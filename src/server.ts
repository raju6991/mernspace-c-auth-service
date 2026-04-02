function welcome(name: string) {
    console.log('hello')

    const user = {
        name: 'raju',
    }
    const fname = user.name
    return name + fname
}

welcome('Raju')
