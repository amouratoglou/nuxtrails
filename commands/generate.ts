import fs from 'fs/promises'
import path from 'path'
import { execa } from 'execa'
import chalk from 'chalk'
import { runInitPrisma } from './init-prisma'
import { existsSync } from 'fs'

function parseFields(fields: string[]): string {
  return fields
    .map(field => {
      const [name, type] = field.split(':')
      const prismaType = mapToPrismaType(type)
      return `  ${name} ${prismaType}`
    })
    .join('\n')
}

function mapToPrismaType(type: string): string {
  switch (type) {
    case 'string': return 'String'
    case 'text': return 'String'
    case 'boolean': return 'Boolean'
    case 'int': return 'Int'
    case 'float': return 'Float'
    case 'date': return 'DateTime'
    default: return 'String' // default to String if unknown
  }
}

export async function runGenerateModel(modelName: string, fields: string[]) {

  if (!existsSync('prisma/schema.prisma')) {
    console.log('[nuxtrails] Prisma not initialized. Running init...')
    await runInitPrisma()
  }
  
  const className = modelName.charAt(0).toUpperCase() + modelName.slice(1)
  const tableName = className.toLowerCase() + 's'

  const schemaPath = path.resolve('prisma/schema.prisma')
  const schema = await fs.readFile(schemaPath, 'utf8')

  const newModel = `
model ${className} {
  id        Int      @id @default(autoincrement())
${parseFields(fields)}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`

  if (schema.includes(`model ${className}`)) {
    console.log(chalk.yellow(`⚠️ Model "${className}" already exists in schema.prisma`))
    return
  }

  const updatedSchema = schema.trim() + '\n\n' + newModel
  await fs.writeFile(schemaPath, updatedSchema)
  console.log(chalk.green(`✅ Added model "${className}" to prisma/schema.prisma`))

  // Run Prisma migration and generate
  console.log(chalk.cyan(`📦 Running Prisma migration...`))
  await execa('npx', ['prisma', 'migrate', 'dev', '--name', `create-${tableName}`], { stdio: 'inherit' })

  console.log(chalk.cyan(`📚 Generating Prisma client...`))
  await execa('npx', ['prisma', 'generate'], { stdio: 'inherit' })

  console.log(chalk.green(`🎉 Model "${className}" scaffolded in Prisma!`))

  console.log(chalk.cyan(`📚 Generating API routes...`))
  await generateApiRoutes(modelName)

}

async function generateApiRoutes(modelName: string) {
    const className = modelName.charAt(0).toUpperCase() + modelName.slice(1)
    const routeBase = className.toLowerCase() + 's'
    const apiPath = path.resolve(`server/api/${routeBase}`)
  
    await fs.mkdir(apiPath, { recursive: true })
  
    const files = {
      'index.get.ts': `
  import { prisma } from '@/server/prisma'
  
  export default defineEventHandler(async () => {
    return await prisma.${routeBase}.findMany()
  })
  `.trim(),
  
      'create.post.ts': `
  import { prisma } from '@/server/prisma'
  
  export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    return await prisma.${routeBase}.create({ data: body })
  })
  `.trim(),
  
      '[id].get.ts': `
  import { prisma } from '@/server/prisma'
  
  export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    return await prisma.${routeBase}.findUnique({ where: { id } })
  })
  `.trim(),
  
      '[id].put.ts': `
  import { prisma } from '@/server/prisma'
  
  export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)
    return await prisma.${routeBase}.update({ where: { id }, data: body })
  })
  `.trim(),
  
      '[id].delete.ts': `
  import { prisma } from '@/server/prisma'
  
  export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    return await prisma.${routeBase}.delete({ where: { id } })
  })
  `.trim()
    }
  
    for (const [fileName, content] of Object.entries(files)) {
      const filePath = path.join(apiPath, fileName)
      await fs.writeFile(filePath, content)
    }
  
    console.log(chalk.green(`✅ API routes generated in server/api/${routeBase}/`))

    generatePiniaStore(modelName)
  }
  

  async function generatePiniaStore(modelName: string) {
    const className = modelName.charAt(0).toUpperCase() + modelName.slice(1)
    const storeName = modelName.toLowerCase() + 's'
    const filePath = path.resolve(`stores/${storeName}.ts`)
  
    const content = `
  import { defineStore } from 'pinia'
  
  export const use${className}Store = defineStore('${storeName}', {
    state: () => ({
      ${storeName}: [],
      loading: false
    }),
    actions: {
      async fetchAll() {
        this.loading = true
        try {
          this.${storeName} = await $fetch('/api/${storeName}')
        } finally {
          this.loading = false
        }
      },
      async create(data) {
        await $fetch('/api/${storeName}/create', {
          method: 'POST',
          body: data
        })
        await this.fetchAll()
      },
      async update(id, data) {
        await $fetch(\`/api/${storeName}/\${id}\`, {
          method: 'PUT',
          body: data
        })
        await this.fetchAll()
      },
      async delete(id) {
        await $fetch(\`/api/${storeName}/\${id}\`, {
          method: 'DELETE'
        })
        await this.fetchAll()
      },
      async findOne(id) {
        return await $fetch(\`/api/${storeName}/\${id}\`)
      }
    }
  })
  `.trim()
  
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, content)
  
    console.log(chalk.green(`✅ Pinia store generated at stores/${storeName}.ts`))

    await generatePages(modelName)

  }
  

  async function generatePages(modelName: string) {
    const className = modelName.charAt(0).toUpperCase() + modelName.slice(1)
    const slug = modelName.toLowerCase() + 's'
    const pagePath = path.resolve(`pages/${slug}`)
  
    await fs.mkdir(path.join(pagePath, '[id]'), { recursive: true })
  
    const pages: Record<string, string> = {
      'index.vue': `
  <script setup>
  import { use${className}Store } from '@/stores/${slug}'
  
  const store = use${className}Store()
  onMounted(() => store.fetchAll())
  </script>
  
  <template>
    <div>
      <h1>${className} List</h1>
      <NuxtLink :to="'/${slug}/create'">Create New</NuxtLink>
      <ul>
        <li v-for="item in store.${slug}" :key="item.id">
          <NuxtLink :to="'/${slug}/' + item.id">{{ item.title || item.id }}</NuxtLink>
        </li>
      </ul>
    </div>
  </template>
  `.trim(),
  
      'create.vue': `
  <script setup>
  import { use${className}Store } from '@/stores/${slug}'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const store = use${className}Store()
  const router = useRouter()
  const form = ref({})
  
  async function submit() {
    await store.create(form.value)
    router.push('/${slug}')
  }
  </script>
  
  <template>
    <div>
      <h1>Create ${className}</h1>
      <form @submit.prevent="submit">
        <input v-model="form.title" placeholder="Title" />
        <button type="submit">Save</button>
      </form>
    </div>
  </template>
  `.trim(),
  
      '[id].vue': `
  <script setup>
  import { use${className}Store } from '@/stores/${slug}'
  import { useRoute } from 'vue-router'
  import { ref, onMounted } from 'vue'
  
  const route = useRoute()
  const store = use${className}Store()
  const item = ref(null)
  
  onMounted(async () => {
    item.value = await store.findOne(route.params.id)
  })
  </script>
  
  <template>
    <div v-if="item">
      <h1>{{ item.title || 'Detail' }}</h1>
      <pre>{{ item }}</pre>
      <NuxtLink :to="'/${slug}/' + item.id + '/edit'">Edit</NuxtLink>
    </div>
  </template>
  `.trim(),
  
      '[id]/edit.vue': `
  <script setup>
  import { use${className}Store } from '@/stores/${slug}'
  import { useRoute, useRouter } from 'vue-router'
  import { ref, onMounted } from 'vue'
  
  const route = useRoute()
  const router = useRouter()
  const store = use${className}Store()
  const form = ref({})
  
  onMounted(async () => {
    form.value = await store.findOne(route.params.id)
  })
  
  async function submit() {
    await store.update(route.params.id, form.value)
    router.push('/${slug}')
  }
  </script>
  
  <template>
    <div>
      <h1>Edit ${className}</h1>
      <form @submit.prevent="submit">
        <input v-model="form.title" placeholder="Title" />
        <button type="submit">Save</button>
      </form>
    </div>
  </template>
  `.trim()
    }
  
    for (const [name, content] of Object.entries(pages)) {
      const filePath = path.join(pagePath, name)
      await fs.writeFile(filePath, content)
    }
  
    console.log(chalk.green(`✅ Nuxt pages generated in pages/${slug}/`))
    await generateComponents(modelName)

  }
  

  async function generateComponents(modelName: string) {
    const className = modelName.charAt(0).toUpperCase() + modelName.slice(1)
    const slug = modelName.toLowerCase() + 's'
    const compPath = path.resolve('components')
  
    await fs.mkdir(compPath, { recursive: true })
  
    const formComponent = `
  <script setup>
  defineProps({
    form: Object
  })
  defineEmits(['submit'])
  </script>
  
  <template>
    <form @submit.prevent="$emit('submit')">
      <div>
        <label>Title</label>
        <input v-model="form.title" placeholder="Title" />
      </div>
      <div>
        <label>Body</label>
        <textarea v-model="form.body" placeholder="Body"></textarea>
      </div>
      <div>
        <label>Published</label>
        <input type="checkbox" v-model="form.published" />
      </div>
      <button type="submit">Submit</button>
    </form>
  </template>
  `.trim()
  
    const tableComponent = `
  <script setup>
  defineProps({
    items: Array
  })
  </script>
  
  <template>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Published</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.title }}</td>
          <td>{{ item.published ? '✔️' : '❌' }}</td>
          <td>
            <NuxtLink :to="'/${slug}/' + item.id">View</NuxtLink> |
            <NuxtLink :to="'/${slug}/' + item.id + '/edit'">Edit</NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </template>
  `.trim()
  
    await fs.writeFile(path.join(compPath, `${className}Form.vue`), formComponent)
    await fs.writeFile(path.join(compPath, `${className}Table.vue`), tableComponent)
  
    console.log(chalk.green(`✅ Components generated: ${className}Form.vue, ${className}Table.vue`))

    // Inform the user about the generated CRUD page routes
    console.log(chalk.blue(`🌐 Your CRUD pages are ready:`))
    console.log(`  • List: /${slug}`)
    console.log(`  • Create: /${slug}/create`)
    console.log(`  • Detail: /${slug}/:id`)
    console.log(`  • Edit: /${slug}/:id/edit`)
  }
  