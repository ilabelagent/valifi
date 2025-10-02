<?php
require_once __DIR__.'/../includes/session.php';
require_once __DIR__.'/../includes/db.php';
require_once __DIR__.'/../includes/layout.php';
require_once __DIR__.'/../includes/csrf.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD']==='POST') {
  csrf_verify();
  
  $username = trim($_POST['username'] ?? '');
  $email = trim($_POST['email'] ?? '');
  $password = $_POST['password'] ?? '';
  $confirm = $_POST['confirm_password'] ?? '';
  
  // Validation
  if (!$username || !$email || !$password) {
    $error = 'All fields are required';
  } elseif (strlen($username) < 3) {
    $error = 'Username must be at least 3 characters';
  } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $error = 'Invalid email address';
  } elseif (strlen($password) < 6) {
    $error = 'Password must be at least 6 characters';
  } elseif ($password !== $confirm) {
    $error = 'Passwords do not match';
  } else {
    // Check if username or email already exists
    $check = $pdo->prepare('SELECT id FROM users WHERE username=? OR email=?');
    $check->execute([$username, $email]);
    
    if ($check->fetch()) {
      $error = 'Username or email already exists';
    } else {
      // Create user
      $hash = password_hash($password, PASSWORD_DEFAULT);
      $stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, "user")');
      
      if ($stmt->execute([$username, $email, $hash])) {
        $user_id = $pdo->lastInsertId();
        
        // Give new users some starting balance
        $pdo->prepare('INSERT INTO balances (user_id, asset, free) VALUES (?, "USDT", 1000.00000000)')
            ->execute([$user_id]);
        
        $success = 'Account created successfully! You can now login.';
      } else {
        $error = 'Failed to create account. Please try again.';
      }
    }
  }
}

head('Sign Up - YourCryptoExchange.tech');
?>
<div class="max-w-md mx-auto bg-black/40 border border-green-500/20 rounded-xl p-6">
  <h1 class="text-2xl font-semibold mb-6 text-center">Create Account</h1>
  
  <?php if($error): ?>
    <div class="text-red-400 mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded"><?= htmlspecialchars($error) ?></div>
  <?php endif; ?>
  
  <?php if($success): ?>
    <div class="text-green-400 mb-4 p-3 bg-green-400/10 border border-green-400/20 rounded">
      <?= htmlspecialchars($success) ?>
      <br><a href="/auth/login.php" class="underline">Click here to login</a>
    </div>
  <?php endif; ?>
  
  <?php if(!$success): ?>
  <form method="post" class="space-y-4">
    <?php csrf_field(); ?>
    
    <div>
      <label class="block text-sm text-gray-300 mb-1">Username</label>
      <input name="username" value="<?= htmlspecialchars($_POST['username'] ?? '') ?>" 
             class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 focus:border-green-500 focus:outline-none">
    </div>
    
    <div>
      <label class="block text-sm text-gray-300 mb-1">Email</label>
      <input type="email" name="email" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" 
             class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 focus:border-green-500 focus:outline-none">
    </div>
    
    <div>
      <label class="block text-sm text-gray-300 mb-1">Password</label>
      <input type="password" name="password" 
             class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 focus:border-green-500 focus:outline-none">
      <p class="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
    </div>
    
    <div>
      <label class="block text-sm text-gray-300 mb-1">Confirm Password</label>
      <input type="password" name="confirm_password" 
             class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 focus:border-green-500 focus:outline-none">
    </div>
    
    <button class="w-full py-2 rounded bg-green-600 hover:bg-green-700 font-semibold">Create Account</button>
  </form>
  
  <div class="mt-6 text-center text-sm text-gray-400">
    Already have an account? 
    <a href="/auth/login.php" class="text-green-400 hover:text-green-300">Sign in</a>
  </div>
  <?php endif; ?>
</div>
<?php foot(); ?>