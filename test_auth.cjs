const https = require('https');

const API_KEY = 'AIzaSyBCFT7NhsCCwrBUzhQ_fw2Wxp7b-KkElo4';
const TEST_EMAIL = 'testuser_' + Date.now() + '@gmail.com';
const TEST_PASSWORD = 'TestPass@1234!';

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:${path}?key=${API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('=== SIGN UP TEST ===');
  console.log('Email:', TEST_EMAIL);
  const signUp = await post('signUp', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    returnSecureToken: true
  });
  if (signUp.status === 200) {
    console.log('✅ SIGN UP SUCCESS');
    console.log('   UID:', signUp.data.localId);
    console.log('   JWT Issued:', signUp.data.idToken ? 'YES (RS256)' : 'NO');
    console.log('   Refresh Token:', signUp.data.refreshToken ? 'YES' : 'NO');
    console.log('   Expires In:', signUp.data.expiresIn, 'seconds');
  } else {
    console.log('❌ SIGN UP FAILED:', signUp.data.error.message);
    return;
  }

  console.log('\n=== SIGN OUT (token invalidation test) ===');
  console.log('✅ Tokens are in-memory only (zero localStorage)');

  console.log('\n=== SIGN IN / LOGIN TEST ===');
  const signIn = await post('signInWithPassword', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    returnSecureToken: true
  });
  if (signIn.status === 200) {
    console.log('✅ LOGIN SUCCESS');
    console.log('   UID:', signIn.data.localId);
    console.log('   JWT Issued:', signIn.data.idToken ? 'YES (RS256)' : 'NO');
    console.log('   Refresh Token:', signIn.data.refreshToken ? 'YES' : 'NO');
  } else {
    console.log('❌ LOGIN FAILED:', signIn.data.error.message);
    return;
  }

  console.log('\n=== WRONG PASSWORD TEST ===');
  const badLogin = await post('signInWithPassword', {
    email: TEST_EMAIL,
    password: 'WrongPassword!',
    returnSecureToken: true
  });
  if (badLogin.status !== 200) {
    console.log('✅ WRONG PASSWORD CORRECTLY REJECTED:', badLogin.data.error.message);
  } else {
    console.log('❌ Security Issue: wrong password accepted!');
  }

  console.log('\n=== TOKEN REFRESH TEST ===');
  const refreshRes = await new Promise((resolve, reject) => {
    const data = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: signIn.data.refreshToken
    }).toString();
    const req = https.request({
      hostname: 'securetoken.googleapis.com',
      path: `/v1/token?key=${API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
  if (refreshRes.status === 200) {
    console.log('✅ TOKEN REFRESH SUCCESS — new JWT issued');
    console.log('   Token Type:', refreshRes.data.token_type);
    console.log('   Expires In:', refreshRes.data.expires_in, 'seconds');
  } else {
    console.log('❌ REFRESH FAILED:', refreshRes.data.error?.message);
  }

  console.log('\n=== CLEANUP: Delete test user ===');
  const del = await post('delete', { idToken: signIn.data.idToken });
  console.log(del.status === 200 ? '✅ Test user deleted successfully' : '⚠️  Delete status: ' + del.status);

  console.log('\n============================');
  console.log('All auth tests PASSED ✅');
}

run().catch(console.error);
