const inquirer = require('inquirer')
const childProcess = require('child_process')
inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))
console.log('Starting directory: ' + process.cwd());
const args = process.argv.slice(2); // The first two elements are 'node' and the script filename

const NEW_DIR = './' + (args[0] ?? '')

try {
  process.chdir(NEW_DIR);
  console.log('New directory: ' + process.cwd());
}
catch (err) {
  console.log('chdir: ' + err);
}


const adapterPrompt = {
  type: 'fuzzypath',
  name: 'adapterPath',
  excludePath: nodePath => ['node_modules', '.git', 'cli', '.github', 'adapters', 'helpers', 'utils', '.gitignore', 'README.md' ].includes(nodePath),
  excludeFilter: nodePath => {
    if (nodePath == '.')  return true
    return false
  },
  itemType: 'any',
  rootPath: '.',
  message: 'Select an adapter to run:',
  suggestOnly: false,
  depthLimit: 1,
}

async function run() {
  let adapterPath
  const { debugMode, ...response } = await inquirer.prompt([
    adapterPrompt,
  ])
  adapterPath = response.adapterPath

  while (true) {   // eslint-disable-line
    adapterPrompt.default = adapterPath
    await runAdapter(adapterPath, true)
    const answer = await inquirer.prompt([adapterPrompt])
    adapterPath = answer.adapterPath
  }
}

async function runAdapter(adapterPath, debugMode) {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      LLAMA_SDK_MAX_PARALLEL: 100,
      LLAMA_DEBUG_MODE: !!debugMode
    }

    const startTime = Date.now()
    const child = childProcess.spawn('npx', ['ts-node', '--transpile-only', 'cli/testAdapter.ts',  ...adapterPath.split('/')], {
      env,
    })

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('error', reject)
    child.on('close', function (code) {
      console.log(`
      
      Run time: ${(Date.now() - startTime) / 1000} (seconds)
      
      `)
      resolve()
    }) 
  })
}

run()