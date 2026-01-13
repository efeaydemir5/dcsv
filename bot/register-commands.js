const { REST, Routes, SlashCommandBuilder } = require('discord.js');
// Load .env.local first (preferred), fallback to .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const commands = [
  new SlashCommandBuilder().setName('onecikar').setDescription('Sunucuyu öne çıkar (bump)'),
  new SlashCommandBuilder()
    .setName('sunucuekle')
    .setDescription('Sunucunu siteye ekle (bot gerekli)')
    .addStringOption((opt) =>
      opt
        .setName('kategori')
        .setDescription('Kategori seç')
        .setRequired(true)
        .addChoices(
          { name: 'Public', value: 'Public' },
          { name: 'Oyun', value: 'Oyun' },
          { name: 'Sohbet', value: 'Sohbet' },
          { name: 'Anime', value: 'Anime' },
          { name: 'RP', value: 'RP' },
          { name: 'Yazılım', value: 'Yazılım' },
          { name: 'Eğitim', value: 'Eğitim' },
          { name: 'Müzik', value: 'Müzik' },
          { name: 'Diğer', value: 'Diğer' }
        )
    )
    .addStringOption((opt) =>
      opt
        .setName('kisa')
        .setDescription('Kısa açıklama (min 60 karakter)')
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('aciklama')
        .setDescription('Ana açıklama (min 180 karakter)')
        .setRequired(true)
    )
].map((c) => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const appId = process.env.CLIENT_ID || process.env.DISCORD_CLIENT_ID;

(async () => {
  try {
    console.log('Registering application commands...');
    if (!appId) throw new Error('Missing CLIENT_ID/DISCORD_CLIENT_ID (Discord Application ID)');
    await rest.put(Routes.applicationCommands(appId), { body: commands });
    console.log('Commands registered.');
  } catch (err) {
    console.error(err);
  }
})();
