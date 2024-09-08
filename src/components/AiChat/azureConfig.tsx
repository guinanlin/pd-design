'use client'
import CryptoJS from 'crypto-js';
import { azure } from '@ai-sdk/azure';

const STORAGE_KEY = 'AZURE_OPENAI_CONFIG';
const SECRET_KEY = '123456'; // 请替换为一个复杂的密钥

interface AzureConfig {
  azureApiKey: string;
  azureEndpoint: string;
  azureDeploymentName: string;
  azureApiVersion: string;
  azureResourceName: string;
}

// 加密函数
const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text || '', SECRET_KEY).toString();
};

// 解密函数
const decrypt = (ciphertext: string): string => {
  if (!ciphertext) {
    return '';
  }
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// 保存配置
export const saveAzureConfig = (config: AzureConfig): void => {
  const encryptedConfig = {
    azureApiKey: encrypt(config.azureApiKey),
    azureEndpoint: encrypt(config.azureEndpoint),
    azureDeploymentName: encrypt(config.azureDeploymentName),
    azureApiVersion: encrypt(config.azureApiVersion),
    azureResourceName: encrypt(config.azureResourceName), // 加密资源名称
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedConfig));
};

// 获取配置
export const getAzureConfig = (): AzureConfig | null => {
  const storedConfig = localStorage.getItem(STORAGE_KEY);
  if (!storedConfig) return null;

  const encryptedConfig = JSON.parse(storedConfig);
  return {
    azureApiKey: decrypt(encryptedConfig.azureApiKey),
    azureEndpoint: decrypt(encryptedConfig.azureEndpoint),
    azureDeploymentName: decrypt(encryptedConfig.azureDeploymentName),
    azureApiVersion: decrypt(encryptedConfig.azureApiVersion),
    azureResourceName: decrypt(encryptedConfig.azureResourceName), // 解密资源名称
  };
};

// 清除配置
export const clearAzureConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// 创建并返回 Azure 实例
export const createAzureInstance = (): any => {
  const config = getAzureConfig();
  if (!config) {
    throw new Error("Azure 配置未找到");
  }

  // 返回配置的 Azure 实例
  return azure(config.azureDeploymentName);
};
