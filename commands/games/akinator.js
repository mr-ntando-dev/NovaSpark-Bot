/**
 * ⚡ NovaSpark v9 — Akinator (20 Questions AI Guesser)
 * .akinator start — Bot tries to guess your character
 * .akinator yes/no/maybe/idk — Answer each question
 * .akinator stop — End game
 * Pure logic tree — no API needed.
 * By Dev-Ntando
 */
'use strict';

// Decision tree: each node has a question + yes/no branches (leaf = guess)
const TREE = {
  q: 'Is your character a real person (not fictional)?',
  y: {
    q: 'Is your character currently alive?',
    y: {
      q: 'Is your character an athlete or sports star?',
      y: {
        q: 'Does your character play football (soccer)?',
        y: { guess: 'Cristiano Ronaldo ⚽' },
        n: {
          q: 'Is your character a basketball player?',
          y: { guess: 'LeBron James 🏀' },
          n: { guess: 'Usain Bolt 🏃' },
        },
      },
      n: {
        q: 'Is your character a tech billionaire?',
        y: {
          q: 'Did your character found Tesla or SpaceX?',
          y: { guess: 'Elon Musk 🚀' },
          n: { guess: 'Bill Gates 💻' },
        },
        n: {
          q: 'Is your character a music artist?',
          y: {
            q: 'Is your character female?',
            y: { guess: 'Beyoncé 🎤' },
            n: { guess: 'Drake 🎵' },
          },
          n: {
            q: 'Is your character a political leader?',
            y: { guess: 'Barack Obama 🇺🇸' },
            n: { guess: 'Oprah Winfrey 📺' },
          },
        },
      },
    },
    n: {
      q: 'Is your character a scientist?',
      y: {
        q: 'Is your character known for physics or math?',
        y: { guess: 'Albert Einstein 🧠' },
        n: { guess: 'Marie Curie ⚗️' },
      },
      n: {
        q: 'Is your character known for their speeches or leadership?',
        y: { guess: 'Nelson Mandela ✊' },
        n: { guess: 'Michael Jackson 🕺' },
      },
    },
  },
  n: {
    q: 'Is your character from a movie or TV show?',
    y: {
      q: 'Is your character a superhero?',
      y: {
        q: 'Is your character from Marvel?',
        y: {
          q: 'Does your character wear a metal suit?',
          y: { guess: 'Iron Man / Tony Stark 🦾' },
          n: {
            q: 'Does your character have spider powers?',
            y: { guess: 'Spider-Man 🕷️' },
            n: { guess: 'Captain America 🛡️' },
          },
        },
        n: {
          q: 'Does your character wear a bat suit?',
          y: { guess: 'Batman 🦇' },
          n: { guess: 'Superman 🦸' },
        },
      },
      n: {
        q: 'Is your character from a Disney or Pixar movie?',
        y: {
          q: 'Is your character a talking animal?',
          y: { guess: 'Simba (The Lion King) 🦁' },
          n: { guess: 'Elsa (Frozen) ❄️' },
        },
        n: {
          q: 'Is your character a villain?',
          y: {
            q: 'Is your character from Star Wars?',
            y: { guess: 'Darth Vader ⚔️' },
            n: { guess: 'Thanos 💜' },
          },
          n: {
            q: 'Is your character from a fantasy world like Middle-earth?',
            y: { guess: 'Gandalf 🧙' },
            n: { guess: 'Jack Sparrow ☠️' },
          },
        },
      },
    },
    n: {
      q: 'Is your character from a book or anime?',
      y: {
        q: 'Is your character from anime?',
        y: {
          q: 'Is your character a ninja?',
          y: { guess: 'Naruto Uzumaki 🍥' },
          n: {
            q: 'Is your character a pirate?',
            y: { guess: 'Monkey D. Luffy ⚓' },
            n: { guess: 'Goku (Dragon Ball) 🐉' },
          },
        },
        n: {
          q: 'Is your character a wizard?',
          y: { guess: 'Harry Potter 🧙‍♂️' },
          n: { guess: 'Sherlock Holmes 🔍' },
        },
      },
      n: {
        q: 'Is your character from a video game?',
        y: {
          q: 'Is your character a plumber or Nintendo character?',
          y: { guess: 'Mario 🍄' },
          n: {
            q: 'Does your character wield a Master Sword?',
            y: { guess: 'Link (Legend of Zelda) ⚔️' },
            n: { guess: 'Kratos (God of War) 🪓' },
          },
        },
        n: { guess: 'I\'m stumped! You beat me 🤯' },
      },
    },
  },
};

const sessions = new Map(); // chatId → { node, path, questions }

module.exports = {
  name: 'akinator',
  aliases: ['aki', 'guesswho'],
  description: '🧞 Akinator — Think of someone and I\'ll guess it!',
  category: 'games',

  execute: async ({ from, args, reply }) => {
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'start') {
      sessions.set(from, { node: TREE, path: [], count: 1 });
      const s = sessions.get(from);
      return reply(
        `🧞 *Akinator — Think of a Character!*\n\n` +
        `Think of any person, character, or celebrity. I'll guess it in up to 15 questions!\n\n` +
        `*Question 1:*\n${s.node.q}\n\n` +
        `Reply: *.akinator yes / no / maybe*\n` +
        `Stop anytime: *.akinator stop*`
      );
    }

    if (sub === 'stop') {
      if (!sessions.has(from)) return reply('🧞 No active Akinator game. Start with *.akinator start*');
      sessions.delete(from);
      return reply('🧞 Game stopped. You escaped me... this time! 😤');
    }

    const s = sessions.get(from);
    if (!s) return reply('🧞 No active game! Start with *.akinator start*');

    const ans = sub;
    if (!['yes', 'no', 'maybe', 'idk', 'y', 'n'].includes(ans)) {
      return reply(`🧞 *Question ${s.count}:*\n${s.node.q}\n\nAnswer with: *.akinator yes / no / maybe*`);
    }

    const goYes = ['yes', 'y', 'maybe'].includes(ans);
    const branch = goYes ? s.node.y : s.node.n;

    if (!branch) {
      sessions.delete(from);
      return reply('🧞 I ran out of questions — you win! 🎉');
    }

    // Leaf node = guess
    if (branch.guess) {
      sessions.delete(from);
      return reply(
        `🧞 *I know who it is!*\n\n` +
        `Your character is...\n\n` +
        `🎯 *${branch.guess}*\n\n` +
        `Was I right? 😏 Play again: *.akinator start*`
      );
    }

    // Next question
    s.node = branch;
    s.count++;
    sessions.set(from, s);

    if (s.count > 15) {
      sessions.delete(from);
      return reply('🧞 After 15 questions I give up — you beat me! 🏆 Play again: *.akinator start*');
    }

    return reply(`🧞 *Question ${s.count}:*\n${branch.q}\n\nAnswer: *.akinator yes / no / maybe*`);
  },
};
