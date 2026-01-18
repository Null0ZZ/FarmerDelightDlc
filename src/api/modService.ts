import { Contribution, ModMeta } from '../types';
import { mods as seedMods, seedContributions } from '../data/mods';

let modsStore: ModMeta[] = JSON.parse(JSON.stringify(seedMods));
let contributionsStore: Contribution[] = JSON.parse(JSON.stringify(seedContributions));

const wait = (ms = 240) => new Promise((resolve) => setTimeout(resolve, ms));

export const modService = {
  async listMods(): Promise<ModMeta[]> {
    await wait();
    return modsStore;
  },

  async addCategory(modId: string, name: string, description?: string) {
    await wait();
    const mod = modsStore.find((m) => m.id === modId);
    if (!mod) throw new Error('Mod not found');
    const id = name.trim().toLowerCase().replace(/\s+/g, '-');
    const exists = mod.categories.some((c) => c.id === id);
    if (exists) return mod;
    mod.categories.push({ id, name, description });
    return mod;
  },

  async assignCategory(modId: string, itemId: string, categoryId: string, contributor: string) {
    await wait();
    const mod = modsStore.find((m) => m.id === modId);
    if (!mod) throw new Error('Mod not found');
    const item = mod.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');
    item.currentCategoryId = categoryId;

    contributionsStore.unshift({
      id: crypto.randomUUID(),
      modId,
      itemId,
      newCategoryId: categoryId,
      contributor,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });

    return { mod, contributions: contributionsStore };
  },

  async listContributions(modId?: string) {
    await wait();
    if (!modId) return contributionsStore;
    return contributionsStore.filter((c) => c.modId === modId);
  }
};
