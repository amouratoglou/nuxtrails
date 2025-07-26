import { execa } from 'execa'
import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import { existsSync } from 'fs'

export async function runNewProject(projectName: string) {
  const projectPath = path.resolve(projectName)



if (existsSync(projectPath)) {
  console.log(chalk.red(`❌ Folder "${projectName}" already exists.`))
  process.exit(1)
}

  console.log(chalk.cyan(`🚀 Creating new Nuxt 4 project: ${projectName}`))

  // Step 1: Create base Nuxt app
  await execa('npx', ['nuxi', 'init', projectName], { stdio: 'inherit' })

  // Step 2: Install dependencies
  console.log(chalk.cyan('📦 Installing dependencies...'))
  await execa('npm', ['install'], { cwd: projectPath, stdio: 'inherit' })
  await execa('npm', ['install', '-D', 'prisma'], { cwd: projectPath, stdio: 'inherit' })
  await execa('npm', ['install', '@prisma/client', 'pinia'], { cwd: projectPath, stdio: 'inherit' })

  // Step 3: Initialize Prisma
  console.log(chalk.cyan('🧬 Initializing Prisma...'))
  await execa('npx', ['prisma', 'init'], { cwd: projectPath, stdio: 'inherit' })

  // Step 4: Create common folders
  const folders = ['server/api', 'stores', 'components']
  for (const dir of folders) {
    await fs.mkdir(path.join(projectPath, dir), { recursive: true })
  }

  console.log(chalk.green(`✅ Project ${projectName} created!`))
  console.log(chalk.green(`💡 Next steps:`))
  console.log(chalk.yellow(`  cd ${projectName}`))
  console.log(chalk.yellow(`  nuxtrails generate model Post title:string body:text`))
}
