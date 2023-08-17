/*
 * Copyright contributors to the Galasa project
 */
import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { ProtoGrpcType } from '@/generated/grpc/dex';
import { Client__Output } from '@/generated/grpc/api/Client';
import { CreateClientReq } from '@/generated/grpc/api/CreateClientReq';

const PROTO_PATH = './src/utils/grpc/dex.proto';
const packageDefinition = loadSync(PROTO_PATH);
const proto = loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;

const client = new proto.api.Dex(`${process.env.DEX_GRPC_HOSTNAME}`, credentials.createInsecure());

// Creates a new Dex client using Dex's gRPC API, wrapped in a promise to allow for blocking calls.
export const createDexClient = (callbackUrl: string) => {
  const clientReq: CreateClientReq = {
    client: {
      redirectUris: [callbackUrl],
    },
  };

  return new Promise<Client__Output | undefined>((resolve, reject) => {
    client.CreateClient(clientReq, (err, value) => {
      if (err == null) {
        resolve(value?.client);
      } else {
        reject(err);
      }
    });
  });
};