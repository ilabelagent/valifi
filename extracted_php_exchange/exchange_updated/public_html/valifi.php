<?php
// Valifi integration page
// This page demonstrates how to interact with the Valifi FinTech Bot API running on Node.js.

require_once __DIR__ . '/includes/layout.php';

// Determine the base URL for the Valifi API. You can override this via an environment
// variable (VALIFI_API_URL) so that the PHP frontend can call your Node server when
// deployed on AWS or another host. By default it points to localhost:3001.
$valifiUrl = getenv('VALIFI_API_URL') ?: 'http://localhost:3001';

// Initialize containers for messages and API responses
$apiResponse = null;
$apiError = null;

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // Helper function to perform an HTTP request to the Valifi API
    function valifi_request($method, $endpoint, $data = null, $jwt = null, $baseUrl) {
        $url = rtrim($baseUrl, '/') . $endpoint;
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
        $headers = [ 'Content-Type: application/json' ];
        if ($jwt) {
            $headers[] = 'Authorization: Bearer ' . $jwt;
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        $response = curl_exec($ch);
        if ($response === false) {
            $error = curl_error($ch);
            curl_close($ch);
            return [null, $error];
        }
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return [ ['status' => $statusCode, 'data' => json_decode($response, true)], null ];
    }

    switch ($action) {
        case 'fetch_bots':
            [$apiResponse, $apiError] = valifi_request('GET', '/api/bots', null, null, $valifiUrl);
            break;
        case 'view_wallet':
            [$apiResponse, $apiError] = valifi_request('GET', '/api/wallet', null, null, $valifiUrl);
            break;
        case 'register':
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $firstName = $_POST['first_name'] ?? '';
            $lastName = $_POST['last_name'] ?? '';
            if ($email && $password && $firstName) {
                $data = [
                    'email' => $email,
                    'password' => $password,
                    'firstName' => $firstName,
                    'lastName' => $lastName,
                ];
                [$apiResponse, $apiError] = valifi_request('POST', '/api/auth/register', $data, null, $valifiUrl);
            } else {
                $apiError = 'Please fill in all required fields for registration.';
            }
            break;
        case 'login':
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            if ($email && $password) {
                $data = [ 'email' => $email, 'password' => $password ];
                [$apiResponse, $apiError] = valifi_request('POST', '/api/auth/login', $data, null, $valifiUrl);
            } else {
                $apiError = 'Please provide your email and password to login.';
            }
            break;
    }
}

head('Valifi Bot Integration');
?>

<h1 class="text-3xl font-bold mb-6">Valifi Bot Integration</h1>

<p class="mb-4 text-gray-300">
    This page demonstrates a simple integration between the PHP exchange frontend and the
    <strong>Valifi FinTech Bot</strong> API running on Node.js. Use the buttons below to fetch
    bot listings, view a demo wallet balance, or register/login to the Valifi service.
    In production you should secure these endpoints, handle JWTs securely and move
    API requests into an application layer. For demonstration purposes the responses
    are displayed directly on this page.
</p>

<div class="grid gap-6 md:grid-cols-2">
    <!-- Fetch Bots Card -->
    <div class="bg-black/60 p-4 rounded-lg border border-green-500/20">
        <h2 class="text-xl font-semibold mb-2">List Available Bots</h2>
        <p class="mb-2 text-gray-400">Retrieve the list of active trading/finance bots from the Valifi API.</p>
        <form method="post">
            <input type="hidden" name="action" value="fetch_bots" />
            <button type="submit" class="mt-2 bg-green-500 hover:bg-green-600 text-black font-semibold py-2 px-4 rounded">
                Fetch Bots
            </button>
        </form>
    </div>

    <!-- View Wallet Card -->
    <div class="bg-black/60 p-4 rounded-lg border border-green-500/20">
        <h2 class="text-xl font-semibold mb-2">View Wallet Balance</h2>
        <p class="mb-2 text-gray-400">Check the default user wallet from the Valifi API (demo data).</p>
        <form method="post">
            <input type="hidden" name="action" value="view_wallet" />
            <button type="submit" class="mt-2 bg-green-500 hover:bg-green-600 text-black font-semibold py-2 px-4 rounded">
                View Wallet
            </button>
        </form>
    </div>

    <!-- Registration Card -->
    <div class="bg-black/60 p-4 rounded-lg border border-green-500/20">
        <h2 class="text-xl font-semibold mb-2">Register New User</h2>
        <p class="mb-2 text-gray-400">Create a new account on the Valifi platform.</p>
        <form method="post" class="space-y-2">
            <input type="hidden" name="action" value="register" />
            <div>
                <input type="email" name="email" placeholder="Email" class="w-full p-2 bg-transparent border border-green-500/20 rounded text-white" required />
            </div>
            <div>
                <input type="text" name="first_name" placeholder="First Name" class="w-full p-2 bg-transparent border border-green-500/20 rounded text-white" required />
            </div>
            <div>
                <input type="text" name="last_name" placeholder="Last Name" class="w-full p-2 bg-transparent border border-green-500/20 rounded text-white" />
            </div>
            <div>
                <input type="password" name="password" placeholder="Password" class="w-full p-2 bg-transparent border border-green-500/20 rounded text-white" required />
            </div>
            <button type="submit" class="mt-2 bg-green-500 hover:bg-green-600 text-black font-semibold py-2 px-4 rounded">
                Register
            </button>
        </form>
    </div>

    <!-- Login Card -->
    <div class="bg-black/60 p-4 rounded-lg border border-green-500/20">
        <h2 class="text-xl font-semibold mb-2">Login</h2>
        <p class="mb-2 text-gray-400">Login to your Valifi account to obtain a JWT.</p>
        <form method="post" class="space-y-2">
            <input type="hidden" name="action" value="login" />
            <div>
                <input type="email" name="email" placeholder="Email" class="w-full p-2 bg-transparent border border-green-500/20 rounded text-white" required />
            </div>
            <div>
                <input type="password" name="password" placeholder="Password" class="w-full p-2 bg-transparent border border-green-500/20 rounded text-white" required />
            </div>
            <button type="submit" class="mt-2 bg-green-500 hover:bg-green-600 text-black font-semibold py-2 px-4 rounded">
                Login
            </button>
        </form>
    </div>
</div>

<?php if ($apiError): ?>
    <div class="mt-6 p-4 bg-red-600/20 border border-red-500/50 rounded text-red-200">
        <strong>Error:</strong> <?= htmlspecialchars($apiError) ?>
    </div>
<?php endif; ?>

<?php if ($apiResponse && !$apiError): ?>
    <div class="mt-6 p-4 bg-black/60 border border-green-500/20 rounded overflow-auto">
        <pre class="text-sm text-green-300"><?= htmlspecialchars(json_encode($apiResponse, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)) ?></pre>
    </div>
<?php endif; ?>

<?php
foot();
?>