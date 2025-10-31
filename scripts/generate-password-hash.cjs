#!/usr/bin/env node
/**
 * Password Hash Generator for MangeXis Admin (Vercel Version)
 * 
 * Usage: node scripts/generate-password-hash.cjs [password]
 * 
 * This script generates bcrypt hashes for passwords.
 * Use the generated hashes in your Vercel environment variables.
 */

const bcrypt = require('bcryptjs')

const password = process.argv[2]

if (!password) {
  console.error('❌ Error: Please provide a password')
  console.log('\n📖 Usage: node scripts/generate-password-hash.cjs [your-password]')
  console.log('Example: node scripts/generate-password-hash.cjs MySecurePassword123!')
  process.exit(1)
}

// Generate salt and hash
const saltRounds = 12 // High security
const hash = bcrypt.hashSync(password, saltRounds)

console.log('\n✅ Password hash generated successfully!\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('Original Password:', password)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('Bcrypt Hash:')
console.log(hash)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('📋 Add this to your Vercel Environment Variables:')
console.log('Variable Name: ADMIN_PASSWORD_HASH or FANSUB_PASSWORD_HASH')
console.log('Variable Value:', hash)
console.log('\n⚠️  IMPORTANT: Never commit this hash to Git!')
console.log('⚠️  Store it securely in Vercel dashboard only.\n')

// Test the hash
const isValid = bcrypt.compareSync(password, hash)
console.log('✓ Hash validation test:', isValid ? '✅ PASSED' : '❌ FAILED')
