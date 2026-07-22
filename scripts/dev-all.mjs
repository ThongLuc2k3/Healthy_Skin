import net from 'node:net'
import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const npmCmd = isWindows ? 'npm.cmd' : 'npm'

function findFreePort(startPort, host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    function tryPort(port) {
      const server = net.createServer()

      server.unref()
      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
          tryPort(port + 1)
          return
        }
        reject(error)
      })

      server.listen({ port, host }, () => {
        const { port: freePort } = server.address()
        server.close(() => resolve(freePort))
      })
    }

    tryPort(startPort)
  })
}

function spawnChild(name, args, env) {
  const child = spawn(npmCmd, args, {
    env,
    stdio: 'inherit',
    shell: isWindows,
  })

  child.on('error', (error) => {
    console.error(`[${name}] Không thể khởi chạy tiến trình:`, error)
  })

  return child
}

async function main() {
  const frontendPort = await findFreePort(5173)
  const backendPort = await findFreePort(4000)
  const frontendOrigin = `http://localhost:${frontendPort}`
  const backendApiBaseUrl = `http://localhost:${backendPort}/api`

  console.log(`[dev-all] Frontend sẽ chạy tại ${frontendOrigin}`)
  console.log(`[dev-all] Backend sẽ chạy tại http://localhost:${backendPort}`)

  const backend = spawnChild(
    'BACKEND',
    ['--prefix', 'server', 'run', 'dev'],
    {
      ...process.env,
      PORT: String(backendPort),
      CORS_ORIGIN: process.env.CORS_ORIGIN || frontendOrigin,
    },
  )

  const frontend = spawnChild(
    'FRONTEND',
    ['run', 'dev', '--', '--port', String(frontendPort)],
    {
      ...process.env,
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || backendApiBaseUrl,
    },
  )

  let shuttingDown = false

  function shutdown(exitCode = 0) {
    if (shuttingDown) return
    shuttingDown = true
    backend.kill('SIGTERM')
    frontend.kill('SIGTERM')
    process.exitCode = exitCode
  }

  backend.on('exit', (code, signal) => {
    if (shuttingDown) return
    console.error(`[dev-all] Backend đã dừng (${signal || code}).`)
    shutdown(code ?? 1)
  })

  frontend.on('exit', (code, signal) => {
    if (shuttingDown) return
    console.error(`[dev-all] Frontend đã dừng (${signal || code}).`)
    shutdown(code ?? 1)
  })

  process.on('SIGINT', () => shutdown(0))
  process.on('SIGTERM', () => shutdown(0))
}

main().catch((error) => {
  console.error('[dev-all] Không thể khởi tạo môi trường dev:', error)
  process.exitCode = 1
})
