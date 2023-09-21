import prompts from 'prompts'

function createMinesweeperGrid(size, numberOfBombs) {
  let minesweeperGrid = []

  for (let row = 0; row < size; row++) {
    minesweeperGrid[row] = []
    for (let col = 0; col < size; col++) {
      minesweeperGrid[row][col] = {
        value: '-',
        hasBomb: false,
        nearbyBombs: 0,
      }
    }
  }

  let bombsAdded = 0
  while (bombsAdded < numberOfBombs) {
    const randomRowIndex = Math.floor(Math.random() * size)
    const randomColIndex = Math.floor(Math.random() * size)
    const randomCell = minesweeperGrid[randomRowIndex][randomColIndex]

    if (!randomCell.hasBomb) {
      randomCell.hasBomb = true
      bombsAdded++

      // Calcular o número de bombas próximas para a célula com a bomba
      for (let i = randomRowIndex - 1; i <= randomRowIndex + 1; i++) {
        for (let j = randomColIndex - 1; j <= randomColIndex + 1; j++) {
          if (
            i >= 0 &&
            i < size &&
            j >= 0 &&
            j < size &&
            !(i === randomRowIndex && j === randomColIndex)
          ) {
            minesweeperGrid[i][j].nearbyBombs++
          }
        }
      }
    }
  }

  return minesweeperGrid
}

function logMinesweeper(minesweeperGrid) {
  console.clear()
  console.log('==== CAMPO MINADO ====\n')

  process.stdout.write('   ')
  for (let i = 0; i < minesweeperGrid.length; i++) {
    process.stdout.write(` ${i + 1} `)
  }
  console.log()
  console.log()

  for (let i = 0; i < minesweeperGrid.length; i++) {
    const row = minesweeperGrid[i]
    process.stdout.write(`${i + 1}  `)
    for (let j = 0; j < row.length; j++) {
      const col = row[j]
      process.stdout.write(` ${col.value} `)
    }
    console.log()
  }
  console.log()
}

;(async () => {
  console.clear()
  const minesweeperSize = await prompts({
    type: 'number',
    name: 'value',
    message: 'Qual o tamanho do campo minado? (2-9)',
    validate: (value) =>
      value > 9 || value < 2 ? 'Tamanho permitido entre 2 e 9' : true,
  })

  const numberOfBombs = await prompts({
    type: 'number',
    name: 'value',
    message: `Quantas bombas serão espalhadas aleatoriamente pelo campo? (1-${
      minesweeperSize.value * minesweeperSize.value
    })`,
    validate: (value) =>
      value > minesweeperSize.value * minesweeperSize.value || value < 1
        ? `Quantidade de bombas inválidas (o valor deve está entre 1 e ${
            minesweeperSize.value * minesweeperSize.value
          })`
        : true,
  })

  let minesweeperGrid = createMinesweeperGrid(
    minesweeperSize.value,
    numberOfBombs.value
  )

  let gameOver = false
  let win = false
  while (!gameOver && !win) {
    logMinesweeper(minesweeperGrid)

    let bombsAddedQuantity = 0

    for (let i = 0; i < minesweeperGrid.length; i++) {
      const row = minesweeperGrid[i]
      for (let j = 0; j < row.length; j++) {
        const col = row[j]

        if (col.value === 'X') {
          bombsAddedQuantity++
        }
      }
    }

    const response = await prompts([
      {
        type: 'number',
        name: 'row',
        message: `Informe o valor para a linha: (1-${minesweeperSize.value})`,
        validate: (value) =>
          value > minesweeperSize.value || value < 1
            ? `Valor permitido entre 1 e ${minesweeperSize.value}`
            : true,
      },
      {
        type: 'number',
        name: 'column',
        message: `Informe o valor para a coluna: (1-${minesweeperSize.value})`,
        validate: (value) =>
          value > minesweeperSize.value || value < 1
            ? `Valor permitido entre 1 e ${minesweeperSize.value}`
            : true,
      },
      {
        type: 'select',
        name: 'type',
        message: 'Informe tipo da jogada:',
        choices: [
          { title: 'Livre', value: 'free' },
          { title: 'Desmarcar', value: 'demarcate' },
          ...(bombsAddedQuantity < numberOfBombs.value
            ? [{ title: 'Bomba', value: 'bomb' }]
            : []),
        ],
      },
    ])

    const cell = minesweeperGrid[response.row - 1][response.column - 1]

    if (response.type === 'free') {
      if (cell.hasBomb) {
        gameOver = true
      } else {
        cell.value = cell.nearbyBombs
      }
    }

    if (response.type === 'bomb') {
      cell.value = 'X'
      bombsAddedQuantity++
    }

    if (response.type === 'demarcate') {
      cell.value = '-'
    }

    let bombsCorrectQuantity = 0
    for (let i = 0; i < minesweeperGrid.length; i++) {
      const row = minesweeperGrid[i]
      for (let j = 0; j < row.length; j++) {
        const col = row[j]

        if (col.value === 'X') {
          bombsCorrectQuantity++
        }
      }
    }

    if (bombsCorrectQuantity === numberOfBombs.value) {
      win = true
    }
  }

  minesweeperGrid.forEach((row) => {
    row.forEach((cell) => {
      if (cell.hasBomb) {
        cell.value = 'X'
      } else {
        cell.value = '-'
      }
    })
  })
  logMinesweeper(minesweeperGrid)

  if (gameOver) {
    console.log('\nGame Over!\n\n')
  }

  if (win) {
    console.log('\nYou Win!\n\n')
  }
})()
