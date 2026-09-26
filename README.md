# 🤖 AI Prospection System

Système d'IA hybride pour automatiser la recherche d'emploi (Module 1) et la prospection B2B (Module 2) avec un cycle de 24h et validation humaine.

## 🎯 Objectifs
- **Module 1** : Candidatures automatisées (CV + Lettre) sur LinkedIn, Indeed, WTTJ.
- **Module 2** : Prospection B2B avec audit automatique des sites cibles.
- **Cycle 24h** : Scraping nocturne, validation humaine (08h30-09h30), envoi échelonné (09h30-11h30).
- **Quotas stricts** : 10 candidatures + 10 prospections par jour maximum.

## 🛠️ Stack Technique
- **Frontend** : Next.js 15 + Tailwind CSS + Clerk (Auth)
- **Backend** : NestJS (API REST)
- **Workers** : Node.js + BullMQ + node-cron
- **Database** : PostgreSQL (Neon) + Drizzle ORM
- **Vector Store** : Qdrant (RAG)
- **IA** : Google Gemini 1.5 Pro
- **Scraping** : ScraperAPI + Cheerio
- **Storage** : Cloudflare R2
- **Email** : Resend

## 🚀 Installation

### 1. Prérequis
- Node.js >= 18
- pnpm >= 9
- Docker (optionnel, pour les tests locaux)

### 2. Installation des dépendances
```bash
pnpm install