/**
 * NovaSpark Bot v3 — BMI Calculator
 * .bmi <weight_kg> <height_cm>  — instant BMI + personalised advice
 * By Dev-Ntando
 */
'use strict';

const database = require('../../database');

module.exports = {
  name: 'bmi',
  aliases: ['bodymass', 'weight'],
  description: 'Calculate your BMI and get personalised health advice',
  category: 'free',

  execute: async ({ sock, from, sender, args, reply }) => {
    database.logCommand(sender, 'bmi');

    if (args.length < 2) {
      return reply(
        '⚖️ *BMI Calculator*\n\n' +
        'Usage: *.bmi <weight kg> <height cm>*\n\n' +
        'Examples:\n' +
        '  .bmi 70 175\n' +
        '  .bmi 55 162\n\n' +
        '_Weight in kilograms · Height in centimeters_'
      );
    }

    const weight = parseFloat(args[0]);
    const height = parseFloat(args[1]);

    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
      return reply('❌ Invalid values. Both must be positive numbers.\nExample: *.bmi 70 175*');
    }

    if (weight > 500 || height > 300 || height < 50) {
      return reply('❌ Please use realistic values.\nWeight: 1–500 kg · Height: 50–300 cm');
    }

    const heightM = height / 100;
    const bmi     = weight / (heightM * heightM);
    const bmiStr  = bmi.toFixed(1);

    let category, emoji, advice, range;

    if (bmi < 16) {
      category = 'Severely Underweight'; emoji = '⚠️';
      range    = '< 16';
      advice   = 'You need urgent nutritional support. Please see a doctor as soon as possible. Focus on calorie-dense, nutritious foods — nuts, avocado, eggs, dairy.';
    } else if (bmi < 18.5) {
      category = 'Underweight'; emoji = '📉';
      range    = '16 – 18.4';
      advice   = 'You\'re below a healthy weight. Increase your calorie intake with protein-rich, whole foods. Consider speaking to a nutritionist.';
    } else if (bmi < 25) {
      category = 'Healthy Weight'; emoji = '✅';
      range    = '18.5 – 24.9';
      advice   = 'You\'re in the healthy weight range — well done! Maintain it with balanced meals and regular physical activity.';
    } else if (bmi < 30) {
      category = 'Overweight'; emoji = '📈';
      range    = '25 – 29.9';
      advice   = 'Slightly above the healthy range. Focus on portion control, reduce processed foods and sugars, and add 30 min of movement per day.';
    } else if (bmi < 35) {
      category = 'Obese Class I'; emoji = '⚠️';
      range    = '30 – 34.9';
      advice   = 'This range increases risk for heart disease and diabetes. A sustainable calorie deficit + consistent exercise is the path forward. A dietitian can help.';
    } else {
      category = 'Obese Class II+'; emoji = '🚨';
      range    = '35+';
      advice   = 'Seek medical guidance. This range carries serious health risks. A doctor can help create a safe weight management plan.';
    }

    // ── Visual BMI bar ────────────────────────────────────────────────────────
    const barSteps = [
      { label: 'Underweight', max: 18.5, icon: '🔵' },
      { label: 'Healthy',     max: 25,   icon: '🟢' },
      { label: 'Overweight',  max: 30,   icon: '🟡' },
      { label: 'Obese',       max: 100,  icon: '🔴' },
    ];
    const barDisplay = barSteps.map(step => {
      const active = bmi < step.max && !barSteps.slice(0, barSteps.indexOf(step)).some(s => bmi < s.max);
      return `${step.icon}${active ? '*' + step.label + '*' : step.label}`;
    }).join(' › ');

    const msg =
      `⚖️ *BMI Calculator*\n` +
      `${'─'.repeat(28)}\n\n` +
      `  *Weight:*  ${weight} kg\n` +
      `  *Height:*  ${height} cm\n\n` +
      `  *BMI:* ${bmiStr}\n` +
      `  ${emoji} *${category}*  (range ${range})\n\n` +
      `${'─'.repeat(28)}\n` +
      `${barDisplay}\n` +
      `${'─'.repeat(28)}\n\n` +
      `📝 *Advice:*\n${advice}\n\n` +
      `_⚕️ This is general guidance, not medical advice._\n_Nova AI ⚡_`;

    await sock.sendPresenceUpdate('composing', from);
    await reply(msg);
  },
};
