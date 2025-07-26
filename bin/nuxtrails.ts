#!/usr/bin/env tsx

import { cac } from 'cac'
import { runInitPrisma } from '../commands/init-prisma.js'
import { runGenerateModel } from '../commands/generate.js'
import { runNewProject } from '../commands/project.js'


const cli = cac('nuxtrails')

cli
  .command('new <project>', 'Create a new Nuxt 4 project scaffolded with Prisma')
  .action(runNewProject)

cli
  .command('init prisma', 'Set up Prisma with SQLite')
  .action(runInitPrisma)

cli
  .command('generate <type> <name> [...fields]', 'Generate resource files')
  .action((type, name, fields) => {
    if (type === 'model') {
      console.log(`[nuxtrails] Generating model "${name}" with fields:`, fields)
      runGenerateModel(name, fields)
    } else {
      console.log(`[nuxtrails] Unknown generate type: ${type}`)
    }
  })

cli.help()
cli.parse()
