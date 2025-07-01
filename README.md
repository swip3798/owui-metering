# OWUI-Metering

![AGPL-V3 License](https://img.shields.io/badge/license-AGPL--V3-blue)

A self-hosted **metering server, dashboard, and cost monitoring tool** for **[Open-WebUI](https://github.com/open-webui/open-webui)** and **[OpenRouter](https://openrouter.ai/)**.

Automatically track real-time **AI usage costs** charged by OpenRouter, associate them with users, and generate **detailed cost reports** in PDF format.

## Features

- **Real-time cost tracking** per user via Open-WebUI plugin.
- **Dashboard** for monitoring usage and costs.
- **PDF report generation** for billing users.
- **Minimum charge fee** (optional) to add a base cost on top of AI fees.
- **Self-hosted & Docker-ready** for easy deployment.

## Prerequisites

1. **Docker** and **Docker Compose** installed.
2. An **OpenRouter API Key** ([get one here](https://openrouter.ai/keys)).

## Deployment

### 1. Docker Setup

#### Option 1: Standalone Deployment

Add the following to your `docker-compose.yml`:

```yaml
services:
  owui-metering:
    image: swip3798/owui-metering
    container_name: owui-metering
    restart: unless-stopped
    ports:
      - 45000:45000
    volumes:
      - ./open-metering:/app/data
    env_file: '.metering.env'
    healthcheck:
      test: ['CMD', 'wget', '-q', '--spider', 'http://localhost:45000/healthcheck']
      interval: 30s
      timeout: 10s
      retries: 10
```

#### Option 2: Integrated in the same docker-compose with Open-WebUI

```yaml
services:
  openwebui:
    image: ghcr.io/open-webui/open-webui:main
    volumes:
      - ./open-webui:/app/backend/data
    restart: unless-stopped

  owui-metering:
    image: swip3798/owui-metering:latest
    container_name: owui-metering
    restart: unless-stopped
    ports:
      - 45000:45000
    volumes:
      - ./open-metering:/app/data
    env_file: '.metering.env'
    healthcheck:
      test: ['CMD', 'wget', '-q', '--spider', 'http://localhost:45000/healthcheck']
      interval: 30s
      timeout: 10s
      retries: 10
```

### 2. Configure `.metering.env`

Create a `.metering.env` file:

```env
# Argon2 password hash (generate at https://argon2.online/)
PASSWORD_HASH='$argon2id$v=19$m=16,t=2,p=1$aaaaaaaaaaaaaaaa$aaaaaaaaaaaaaaa/aSBQ'

# JWT secret (min 48 chars)
JWT_SECRET=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-0000000000000000000000000000000000000

# API Key for Open-WebUI filter plugin
API_KEY=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

# Optional: Minimum charge per user (in USD)
MINIMUM_CHARGE_FEE=0.5

# Optional: Worker count (default = CPU cores)
WORKER=3
```

### 3. Start the Containers

```bash
docker compose up -d
```

## Open-WebUI Plugin Setup

1. **Access the Admin Panel** in Open-WebUI.
2. Navigate to **Functions** → **+** → **New Function**.
3. Paste the filter plugin code from [`scripts/filter.py`](scripts/filter.py).
4. **Save**, then enable it **globally** (via the three-dot menu).
5. **Configure the plugin valves**:
   - **Endpoint**: Set to `https://your-metering-domain:45000`.
   - **API Key**: Must match the `API_KEY` in `.metering.env`.
   - **Apply settings**.

## Usage

- Access the **dashboard** at `http://your-metering-domain:45000`.
- Log in with the **password** used to generate the Argon2 hash.
- View **real-time costs**, **user reports**, and **generate PDFs**.

## Troubleshooting

- **No data?** Ensure the Open-WebUI plugin is **enabled globally**.
- **HTTPS recommended**: Reverse proxy (e.g., Caddy/Nginx) is recommended for production.
- **Check logs**: `docker compose logs owui-metering`

## License

**AGPL-V3** (GNU Affero General Public License v3.0).

- **Important**:
  - Derivative works or integrations must also be open-sourced under AGPL-V3.
  - If you host a changed version of OWUI-Metering, you also have to make a version of that source code easily available to the user.
  - AGPL-V3 also applies to the Filter Plugin!
- [Full license text](https://www.gnu.org/licenses/agpl-3.0.en.html).

## Data privacy and GDPR

You as the admin are responsible to ensure that you follow the data privacy laws of your country (e.g. the GDPR). This might include informing your users what data is logged when the use your Open-WebUI. OWUI-Metering collects no texts, however, because of how Open-WebUI works, it collect the model-id used in Open-WebUI, not the model-id of OpenRouter. This might be a privacy concern, please inform your users about that!

I am working on getting data retention and user deletion into OWUI-Metering to ensure you can comply to laws in that regard ASAP.

## Contributions Welcome!

OWUI-Metering is an open-source project, and I encourage community contributions! Here’s how you can help:

### Types of Contributions

- **Bug Reports**: Found an issue? [Open a ticket](https://github.com/swip3798/owui-metering/issues) with details.
- **Bug Fixes**: Submit a **pull request** with a quick description of the fix.
- **New Features**: I would love to see support for more providers besides OpenRouter. If you use a different service, feel free to add support for that. I will do my best to make OWUI-Metering more provider agnostic.
- **Documentation**: Improve guides, add examples, or clarify setup steps.

### Guidelines

1. **License Agreement**: All contributions must be licensed under **AGPL-V3** (same as this project). By submitting a PR, you agree to these terms.
2. **Discuss First**: To avoid doing a lot of unnecessary work, feel free to open an issue first to discuss your ideas.
