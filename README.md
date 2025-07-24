# nuxtrails

A CLI tool inspired by Ruby on Rails to scaffold full-stack Nuxt 3 applications with Prisma, API routes, Pinia stores, and pages — all in one command.

## 🚀 Features

- Generate Prisma models
- Auto-run Prisma migrations
- Create RESTful API routes
- Create Pinia stores for CRUD operations
- Generate Nuxt pages and components (Form, Table)
- Consistent naming and project structure

## 📦 Installation

```bash
git clone https://github.com/your-username/nuxtrails
cd nuxtrails
npm install
npm link
```

## 🛠 Usage

```bash
chmod +x bin/nuxtrails.ts
nuxtrails generate model Post title:string body:text published:boolean
```

This will:

- Add `Post` model to `prisma/schema.prisma`
- Run Prisma migration
- Generate API handlers in `server/api/posts`
- Create a Pinia store in `stores/posts.ts`
- Generate pages in `pages/posts/`
- Create reusable components

## 🧪 Development

Run locally without installing globally:

```bash
npm run dev -- generate model Post title:string
```

## 📁 Output Structure

```
nuxt-app/
├── server/api/posts/         # API routes
├── prisma/schema.prisma      # DB models
├── stores/posts.ts           # Pinia store
├── pages/posts/              # List, create, show, edit
├── components/               # Form + Table
├── nuxt.config.ts
└── app.vue

```

```
/server/api/posts/
  - index.get.ts
  - [id].get.ts
  - [id].put.ts
  - [id].delete.ts
  - create.post.ts

/stores/posts.ts

/pages/posts/
  - index.vue
  - create.vue
  - [id].vue
  - [id]/edit.vue

/components/
  - PostForm.vue
  - PostTable.vue
```

## 📘 License

MIT


## generate

nuxtrails generate model Post title:string body:text published:boolean

## basic api 


```
/server/api/posts/
├── index.get.ts        # GET /api/posts        -> list all
├── create.post.ts      # POST /api/posts/create -> create new
├── [id].get.ts         # GET /api/posts/[id]   -> show
├── [id].put.ts         # PUT /api/posts/[id]   -> update
├── [id].delete.ts      # DELETE /api/posts/[id] -> delete


```