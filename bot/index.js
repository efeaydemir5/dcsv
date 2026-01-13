// Sunuculardaki voiceCount'u periyodik güncelle
const { ChannelType } = require('discord.js');
const updateVoiceCounts = async () => {
  const API_URL = process.env.API_URL || 'http://localhost:3003';
  const botToken = process.env.BOT_TOKEN || '';
  for (const guild of client.guilds.cache.values()) {
    let voiceCount = 0;
    guild.channels.cache.forEach((ch) => {
      // Discord.js v14: ChannelType.GuildVoice
      if (ch.type === ChannelType.GuildVoice) {
        voiceCount += ch.members?.size || 0;
      }
    });
    console.log(`[VOICECOUNT] ${guild.name} (${guild.id}): ${voiceCount} kişi seste`);
    // API'ye PATCH ile gönder
    try {
      const res = await fetch(`${API_URL}/api/servers/${guild.id}/voice`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'x-bot-token': botToken,
        },
        body: JSON.stringify({ voiceCount }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error(`[API] voiceCount güncellenemedi: ${guild.id} - ${res.status} ${res.statusText}`, json);
      } else {
        console.log(`[API] voiceCount güncellendi: ${guild.id} -> ${voiceCount}`);
      }
    } catch (e) {
      console.error('voiceCount güncellenemedi:', guild.id, e);
    }
  }
};

client.once('ready', async () => {
  // ...existing code...
  setInterval(updateVoiceCounts, 60 * 1000); // Her 1 dakikada bir güncelle
});
const { Client, GatewayIntentBits } = require('discord.js');
// Load .env.local first (preferred), fallback to .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  try {
    // Sunucu sayısını al
    const guildCount = client.guilds.cache.size;
    // Presence ve bio ayarla
    await client.user.setPresence({
      activities: [{ name: `${guildCount}+ sunucuda aktif! dcsunucu.com`, type: 0 }],
      status: 'online',
    });
    if (client.user.setProfile) {
      // Discord.js v14'te yok, v15+ için
      await client.user.setProfile({
        bio: `${guildCount}+ sunucuda aktif! dcsunucu.com`,
      });
    }
  } catch (e) {
    console.error('Presence/bio ayarlanırken hata:', e);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'onecikar') {
    try {
      await interaction.deferReply({ flags: 64 }); // ephemeral için flags kullan
    } catch (e) {
      // interaction expired veya başka bir hata, devam et
      console.error('deferReply hatası:', e);
      return;
    }

    const guildId = interaction.guildId || interaction.options.getString('guild');
    if (!guildId) {
      try { await interaction.editReply('Bu komutu sunucu içinde kullanın.'); } catch {}
      return;
    }

    const API_URL = process.env.API_URL || 'http://localhost:3000';

    try {
      const res = await fetch(`${API_URL}/api/servers/${guildId}/bump`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-bot-token': process.env.BOT_TOKEN || ''
        },
        body: JSON.stringify({ ownerDiscordId: interaction.user.id })
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json?.error === 'cooldown' && json?.remainingMs) {
          const mins = Math.ceil(json.remainingMs / 60000);
          try { await interaction.editReply(`Bump için beklemen gerekiyor. Kalan: ~${mins} dk`); } catch {}
          return;
        }
        try { await interaction.editReply('Bump başarısız: ' + (json.error || res.statusText)); } catch {}
        return;
      }

      try { await interaction.editReply('Sunucunuz başarıyla öne çıkarıldı! 🎉'); } catch {}
    } catch (err) {
      console.error(err);
      try { await interaction.editReply('Bir hata oluştu: ' + String(err)); } catch {}
    }
  }

  if (interaction.commandName === 'sunucuekle') {
    try {
      await interaction.deferReply({ flags: 64 });
    } catch (e) {
      console.error('deferReply hatası:', e);
      return;
    }

    const guildId = interaction.guildId;
    if (!guildId) {
      try { await interaction.editReply('Bu komutu sunucu içinde kullanın.'); } catch {}
      return;
    }

    const category = interaction.options.getString('kategori', true);
    const shortDesc = interaction.options.getString('kisa', true);
    const longDesc = interaction.options.getString('aciklama', true);

    if (shortDesc.length < 60) {
      try { await interaction.editReply('Kısa açıklama en az 60 karakter olmalı.'); } catch {}
      return;
    }
    if (longDesc.length < 180) {
      try { await interaction.editReply('Ana açıklama en az 180 karakter olmalı.'); } catch {}
      return;
    }

    const API_URL = process.env.API_URL || 'http://localhost:3000';
    const botToken = process.env.BOT_TOKEN || '';

    try {
      const res = await fetch(`${API_URL}/api/servers`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-bot-token': botToken,
        },
        body: JSON.stringify({
          discordId: guildId,
          name: interaction.guild?.name || 'Discord Server',
          description: shortDesc,
          shortDesc,
          longDesc,
          category,
          ownerDiscordId: interaction.user.id,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        try { await interaction.editReply('Sunucu ekleme başarısız: ' + (json.error || res.statusText)); } catch {}
        return;
      }

      try { await interaction.editReply('Sunucun başvuruya alındı! Admin onayından sonra sitede görünecek.'); } catch {}
    } catch (err) {
      console.error(err);
      try { await interaction.editReply('Bir hata oluştu: ' + String(err)); } catch {}
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
