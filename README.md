# Nuxtrails

## What is nuxtrails ?

This is personal tool, let's see how it goes, and if someone else finds it useful, great!

**It is a opinionated, Rails-inspired scaffolding CLI for Nuxt 4 + Prisma.**  It is powered by the amazing nuxi tool, it goes one step beyond with some of the things it will create for you. 

- Generate models, 
- APIs endpoints. 
- Pinia store for each model.
- Page routes to view your data. 
- and components to render it.

... just like Rails, but with Vue & Nuxt! I hope it saves you time and makes building fullstack Nuxt apps easier!

You can paste this command to your LLM to to create the commands for you to generate your desired model. 

---

## ✨ What It Does

`nuxtrails` is a fullstack CLI generator for Nuxt 4 projects.

When you run:

```bash
nuxtrails generate model Post title:string body:text published:boolean
```

It will:

✅ Create a Prisma model in `prisma/schema.prisma`  
✅ Run `prisma migrate dev`  
✅ Generate full RESTful API under `server/api/posts`  
✅ Create a Pinia store in `stores/posts.ts`  
✅ Scaffold CRUD pages in `pages/posts/`  
✅ Generate reusable Vue components (`PostForm.vue`, `PostTable.vue`)  
✅ Auto-generate routes based on file system


---

## Quick Start

### Option 1: Use via `npx` (no install)

```bash
npx nuxtrails new blog
cd blog
npx nuxtrails generate model Post title:string body:text published:boolean
```

---

### Option 2: Install globally

```bash
npm install -g nuxtrails

# Create new Nuxt 4 project scaffolded with Prisma
nuxtrails new blog
cd blog

# Generate a full model with API + pages + store
nuxtrails generate model Post title:string body:text published:boolean
```

---

## 📁 Output Structure

```
blog/
├── prisma/
│   └── schema.prisma
├── server/api/posts/
│   ├── index.get.ts
│   ├── create.post.ts
│   ├── [id].get.ts
│   ├── [id].put.ts
│   └── [id].delete.ts
├── stores/posts.ts
├── pages/posts/
│   ├── index.vue
│   ├── create.vue
│   ├── [id].vue
│   └── [id]/edit.vue
└── components/
    ├── PostForm.vue
    └── PostTable.vue
```

---

## 📦 Dependencies It Sets Up

When you run `nuxtrails new blog`, it installs:
- Nuxt 4 (via `nuxi init`)
- Prisma + @prisma/client
- Pinia (via `@pinia/nuxt`)

---

## 🛠 Requirements

- Node.js >= 18
- npm or pnpm
- Internet access (to run `nuxi`, install dependencies)

---

## 📘 License

MIT
