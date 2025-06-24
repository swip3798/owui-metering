npx drizzle-kit push
# Set the worker count based on the environment variable
if [ -n "$WORKER" ]; then
  worker_count="-i $WORKER"
else
  worker_count="-i max"
fi

pm2 start express-server.js $worker_count --attach
