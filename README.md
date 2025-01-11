<div align="center">
  <img alt="DSCloud Banner" src="https://mintlify.s3.us-west-1.amazonaws.com/dscloud/logo/services/database-banner.png">
</div>

<h1 align="center">@dscloud/sdkapi</h1>

<p align="center">A NodeJS SDK for interacting with the <a href="https://dscloud.pt" target="_blank">DSCloud</a> API, currently in BETA TEST.</p>

<div align="center">
  <div style="width: fit-content; display: flex; align-items: flex-start; gap: 4px;">
    <img alt="NPM License" src="https://img.shields.io/npm/l/@dscloud/sdkapi">
    <img alt="NPM Downloads" src="https://img.shields.io/npm/dw/@dscloud/sdkapi">
    <a href="https://npmjs.com/package/@dscloud/sdkapi">
      <img alt="NPM Version" src="https://img.shields.io/npm/v/@dscloud/sdkapi">
    </a>
  </div>
</div>

## Installation

```bash
npm install @dscloud/sdkapi
# or
yarn add @dscloud/sdkapi
# or
pnpm add @dscloud/sdkapi
```

## Documentation

Check out our [official documentation](https://docs.dscloud.pt/) for detailed instructions on how to use this library.

## Getting Started

```ts
import { DsCloudAPIKEY } from "@dscloud/sdkapi"
// const { DsCloudAPIKEY } = require("@dscloud/sdkapi");


const api = new DsCloudAPIKEY("Your API Key")
const user = await api.getUsers()
const application = api.getApplication("Application ID")
```

## People

- [@dylan_pf06](https://github.com/dylanpf06)
- [@kallew](https://github.com/Kallew-Laugui-Bot)
