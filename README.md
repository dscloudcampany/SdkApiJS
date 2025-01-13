<div align="center">
  <img alt="DSCloud Banner" src="https://imgur.com/TcqTgsH.png">
</div>

<h1 align="center">@dscloud/sdkapi</h1>

<p align="center">A NodeJS SDK for interacting with the <a href="https://dscloud.pt" target="_blank">DSCloud</a> API, currently in BETA TEST.</p>

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
