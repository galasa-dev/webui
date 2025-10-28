REQUIRED_ENVS=("GALASA_API_SERVER_URL" "GALASA_TOKEN")

for VAR in "${REQUIRED_ENVS[@]}"; do
    if [ -z "${!VAR}" ]; then
        # If GALASA_TOKEN is not set, then check for GALASA_DEV_TOKEN as one or the other must be set.
        if [ "$VAR" = "GALASA_TOKEN" ]; then
            if [ -n "${GALASA_DEV_TOKEN}" ]; then
                continue
            else
                echo "Error: Required environment variable $VAR is not set! You could alternatively set GALASA_DEV_TOKEN instead, and restart VS Code."
            fi
        else
            echo "Error: Required environment variable $VAR is not set! Please set the variable on your host machine and restart VS Code."
        fi

        exit 1
    fi
done

echo "All required environment variables are set."
