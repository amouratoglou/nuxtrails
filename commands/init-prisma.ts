import { execa } from 'execa'
import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'

export async function runInitPrisma() {
  console.log(chalk.cyan('🔧 Installing Prisma...'))
  await execa('npm', ['install', 'prisma', '@prisma/client'])

  console.log(chalk.cyan('📦 Initializing Prisma...'))
  await execa('npx', ['prisma', 'init'])

  const schemaPath = path.resolve('prisma/schema.prisma')

  const schema = `// nuxtrails auto-generated schema
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
`

  await fs.writeFile(schemaPath, schema)
  console.log(chalk.green('✅ Created prisma/schema.prisma'))

  console.log(chalk.cyan('📚 Generating Prisma client...'))
  await execa('npx', ['prisma', 'generate'])

  console.log(chalk.green('🎉 Prisma setup complete!'))
}
