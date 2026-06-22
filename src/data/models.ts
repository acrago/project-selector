import type { Model } from '../types';

export const MODELS: Model[] = [
  // Red Hat AI validated models (category: 'validated') - from validated-models-catalog.yaml
  {
    id: 'deepseek-r1-0528-quantized-w4a16',
    name: 'RedHatAI/DeepSeek-R1-0528-quantized.w4a16',
    category: 'validated',
    provider: 'DeepSeek',
    license: 'MIT',
    task: ['text-to-text'],
    language: ['en'],
    description: 'This model was obtained by quantizing weights of DeepSeek-R1-0528 to INT4 data type.',
    createdAt: '2025-05-30',
    updatedAt: '2025-05-30',
    metrics: { accuracy: 89, quality: 91 },
    performance: { workload: 'chat', latency: '85ms', rps: '2', hardware: ['H100', 'A100'] },
    tensorType: 'INT4',
    modelCard: `# DeepSeek-R1-0528-quantized.w4a16

## Model Overview
- **Model Architecture:** DeepseekV3ForCausalLM
  - **Input:** Text
  - **Output:** Text
- **Model Optimizations:**
  - **Activation quantization:** None
  - **Weight quantization:** INT4
- **Release Date:** 05/30/2025
- **Version:** 1.0
- **Model Developers:** Red Hat (Neural Magic)

### Model Optimizations
This model was obtained by quantizing weights of DeepSeek-R1-0528 to INT4 data type.
This optimization reduces the number of bits used to represent weights from 8 to 4, reducing GPU memory requirements (by approximately 50%).
`,
  },
  {
    id: 'kimi-k2-instruct-quantized-w4a16',
    name: 'RedHatAI/Kimi-K2-Instruct-quantized.w4a16',
    category: 'validated',
    provider: 'Moonshot AI',
    license: 'Modified MIT',
    task: ['text-to-text'],
    language: ['en'],
    description: 'This model was obtained by quantizing weights of moonshotai/Kimi-K2-Instruct to INT4 data type.',
    createdAt: '2025-12-04',
    updatedAt: '2025-12-06',
    metrics: { accuracy: 95, quality: 94 },
    performance: { workload: 'chat', latency: '120ms', rps: '1', hardware: ['H100', 'A100'] },
    tensorType: 'INT4',
  },
  {
    id: 'llama-3.1-8b-instruct',
    name: 'RedHatAI/Llama-3.1-8B-Instruct',
    category: 'validated',
    provider: 'Meta',
    license: 'llama3.1',
    task: ['text-to-text'],
    language: ['en', 'de', 'fr', 'it', 'pt', 'hi', 'es', 'th'],
    description: 'The Meta Llama 3.1 multilingual large language model (LLM) is a collection of pretrained and instruction tuned generative models in 8B.',
    createdAt: '2024-07-11',
    updatedAt: '2025-04-17',
    metrics: { accuracy: 86, quality: 88 },
    performance: { workload: 'chat', latency: '65ms', rps: '3', hardware: ['H100', 'A100', 'L40S'] },
    tensorType: 'FP16',
  },
  {
    id: 'llama-3.1-nemotron-70b-instruct-hf',
    name: 'RedHatAI/Llama-3.1-Nemotron-70B-Instruct-HF',
    category: 'validated',
    provider: 'NVIDIA',
    license: 'llama3.1',
    task: ['text-to-text'],
    language: ['en'],
    description: 'A large language model customized by NVIDIA to improve helpfulness, converted to support the HuggingFace Transformers codebase.',
    createdAt: '2024-02-17',
    updatedAt: '2025-05-08',
    metrics: { accuracy: 93, quality: 94 },
    performance: { workload: 'chat', latency: '200ms', rps: '1', hardware: ['H100', 'H200'] },
    tensorType: 'FP16',
  },
  {
    id: 'llama-3.1-nemotron-70b-instruct-hf-fp8-dynamic',
    name: 'RedHatAI/Llama-3.1-Nemotron-70B-Instruct-HF-FP8-dynamic',
    category: 'validated',
    provider: 'NVIDIA',
    license: 'llama3.1',
    task: ['text-to-text'],
    language: ['en'],
    description: 'This model is a quantized version of Llama-3.1-Nemotron-70B-Instruct. It was obtained by quantizing the weights and activations to FP8 data type.',
    createdAt: '2024-02-17',
    updatedAt: '2025-03-01',
    metrics: { accuracy: 92, quality: 93 },
    performance: { workload: 'chat', latency: '180ms', rps: '1', hardware: ['H100', 'H200'] },
    tensorType: 'FP8',
  },
  {
    id: 'llama-3.3-70b-instruct',
    name: 'RedHatAI/Llama-3.3-70B-Instruct',
    category: 'validated',
    provider: 'Meta',
    license: 'llama3.3',
    task: ['text-to-text'],
    language: ['en', 'de', 'fr', 'it', 'pt', 'hi', 'es', 'th'],
    description: 'Meta Llama 3.3 70B instruction-tuned model with multilingual capabilities.',
    createdAt: '2024-12-06',
    updatedAt: '2025-04-17',
    metrics: { accuracy: 94, quality: 95 },
    performance: { workload: 'chat', latency: '220ms', rps: '1', hardware: ['H100', 'H200'] },
    tensorType: 'FP16',
  },
  {
    id: 'qwen2.5-7b-instruct',
    name: 'RedHatAI/Qwen2.5-7B-Instruct',
    category: 'validated',
    provider: 'Alibaba Cloud',
    license: 'apache-2.0',
    task: ['text-to-text'],
    language: ['zh', 'en', 'fr', 'es', 'pt', 'de', 'it', 'ru', 'ja', 'ko', 'vi', 'th', 'ar'],
    description: 'The instruction-tuned 7B Qwen2.5 model, which has been optimized for multilingual dialogue use cases.',
    createdAt: '2024-02-17',
    updatedAt: '2025-04-18',
    metrics: { accuracy: 89, quality: 91 },
    performance: { workload: 'chat', latency: '70ms', rps: '2', hardware: ['H100', 'A100'] },
    tensorType: 'FP16',
  },
  {
    id: 'qwen2.5-7b-instruct-fp8-dynamic',
    name: 'RedHatAI/Qwen2.5-7B-Instruct-FP8-dynamic',
    category: 'validated',
    provider: 'Alibaba Cloud',
    license: 'apache-2.0',
    task: ['text-to-text'],
    language: ['zh', 'en', 'fr', 'es', 'pt', 'de', 'it', 'ru', 'ja', 'ko', 'vi', 'th', 'ar'],
    description: 'This model was obtained by quantizing activations and weights of Qwen2.5-7B-Instruct to FP8 data type.',
    createdAt: '2024-11-27',
    updatedAt: '2024-11-27',
    metrics: { accuracy: 88, quality: 90 },
    performance: { workload: 'chat', latency: '60ms', rps: '3', hardware: ['H100', 'A100'] },
    tensorType: 'FP8',
  },
  {
    id: 'granite-3.1-8b-instruct',
    name: 'RedHatAI/granite-3.1-8b-instruct',
    category: 'validated',
    provider: 'IBM',
    license: 'apache-2.0',
    task: ['text-to-text'],
    language: ['en', 'de', 'es', 'fr', 'ja', 'pt', 'ar', 'cs', 'it', 'ko', 'nl', 'zh'],
    description: 'The model is designed to respond to general instructions and can be used to build AI assistants for multiple domains, including business applications.',
    createdAt: '2024-02-17',
    updatedAt: '2025-04-18',
    metrics: { accuracy: 87, quality: 89 },
    performance: { workload: 'chat', latency: '65ms', rps: '3', hardware: ['H100', 'A100'] },
    tensorType: 'FP16',
  },
  {
    id: 'granite-3.1-8b-instruct-fp8-dynamic',
    name: 'RedHatAI/granite-3.1-8b-instruct-FP8-dynamic',
    category: 'validated',
    provider: 'IBM',
    license: 'apache-2.0',
    task: ['text-to-text'],
    language: ['en', 'de', 'es', 'fr', 'ja', 'pt', 'ar', 'cs', 'it', 'ko', 'nl', 'zh'],
    description: 'This model was obtained by quantizing the weights and activations of ibm-granite/granite-3.1-8b-instruct to FP8 data type.',
    createdAt: '2025-01-08',
    updatedAt: '2025-01-08',
    metrics: { accuracy: 86, quality: 88 },
    performance: { workload: 'chat', latency: '55ms', rps: '4', hardware: ['H100', 'A100', 'L40S'] },
    tensorType: 'FP8',
  },
  {
    id: 'phi-4',
    name: 'RedHatAI/phi-4',
    category: 'validated',
    provider: 'Microsoft',
    license: 'mit',
    task: ['text-to-text'],
    language: ['en'],
    description: 'A state-of-the-art open model built upon a blend of synthetic datasets, data from filtered public domain websites, and acquired academic books and Q&A datasets.',
    createdAt: '2024-02-17',
    updatedAt: '2025-04-18',
    metrics: { accuracy: 88, quality: 90 },
    performance: { workload: 'chat', latency: '45ms', rps: '5', hardware: ['H100', 'A100', 'L40S'] },
    tensorType: 'FP16',
  },
  {
    id: 'phi-4-fp8-dynamic',
    name: 'RedHatAI/phi-4-FP8-dynamic',
    category: 'validated',
    provider: 'Microsoft',
    license: 'mit',
    task: ['text-to-text'],
    language: ['en'],
    description: 'This model was obtained by quantizing activation and weights of phi-4 to FP8 data type.',
    createdAt: '2025-03-03',
    updatedAt: '2025-03-03',
    metrics: { accuracy: 87, quality: 89 },
    performance: { workload: 'chat', latency: '40ms', rps: '6', hardware: ['H100', 'A100', 'L40S'] },
    tensorType: 'FP8',
  },
  {
    id: 'gemma-2-9b-it',
    name: 'RedHatAI/gemma-2-9b-it',
    category: 'validated',
    provider: 'Google',
    license: 'gemma',
    task: ['text-to-text'],
    language: ['en'],
    description: 'Gemma is a family of lightweight, state-of-the-art open models from Google, built from the same research and technology used to create the Gemini models.',
    createdAt: '2024-02-17',
    updatedAt: '2025-05-19',
    metrics: { accuracy: 86, quality: 88 },
    performance: { workload: 'chat', latency: '70ms', rps: '2', hardware: ['H100', 'A100'] },
    tensorType: 'FP16',
  },
  {
    id: 'gemma-2-9b-it-fp8',
    name: 'RedHatAI/gemma-2-9b-it-FP8',
    category: 'validated',
    provider: 'Google',
    license: 'gemma',
    task: ['text-to-text'],
    language: ['en'],
    description: 'This model was obtained by quantizing the weights and activations of gemma-2-9b-it to FP8 data type.',
    createdAt: '2024-02-17',
    updatedAt: '2024-02-17',
    metrics: { accuracy: 85, quality: 87 },
    performance: { workload: 'chat', latency: '60ms', rps: '3', hardware: ['H100', 'A100'] },
    tensorType: 'FP8',
  },
  {
    id: 'mixtral-8x7b-instruct-v0.1',
    name: 'RedHatAI/Mixtral-8x7B-Instruct-v0.1',
    category: 'validated',
    provider: 'Mistral AI',
    license: 'apache-2.0',
    task: ['text-to-text'],
    language: ['en', 'fr', 'it', 'de', 'es'],
    description: 'A pretrained generative Sparse Mixture of Experts model with 8x7B parameters.',
    createdAt: '2024-02-17',
    updatedAt: '2024-02-17',
    metrics: { accuracy: 90, quality: 91 },
    performance: { workload: 'chat', latency: '150ms', rps: '1', hardware: ['H100', 'A100'] },
    tensorType: 'FP16',
  },
  {
    id: 'nvidia-nemotron-nano-9b-v2-fp8-dynamic',
    name: 'RedHatAI/NVIDIA-Nemotron-Nano-9B-v2-FP8-dynamic',
    category: 'validated',
    provider: 'NVIDIA',
    license: 'nvidia-open-model-license',
    task: ['text-to-text'],
    language: ['en'],
    description: 'This model was obtained by quantizing weights of NVIDIA-Nemotron-Nano-9B-v2 to FP8-Dynamic data type.',
    createdAt: '2025-04-01',
    updatedAt: '2025-04-01',
    metrics: { accuracy: 88, quality: 89 },
    performance: { workload: 'chat', latency: '55ms', rps: '4', hardware: ['H100', 'A100', 'L40S'] },
    tensorType: 'FP8',
  },

  // Red Hat AI models (category: 'redhat') - from models-catalog.yaml
  {
    id: 'granite-7b-redhat-lab',
    name: 'RedHatAI/granite-7b-redhat-lab',
    category: 'redhat',
    provider: 'Red Hat',
    license: 'Apache 2.0',
    task: ['text-generation'],
    language: ['en'],
    description: 'Granite model for inference serving, an instruction-tuned LAB model built via InstructLab.',
    createdAt: '2025-02-10',
    updatedAt: '2025-02-10',
    metrics: { accuracy: 85, quality: 87 },
    modelCard: `# Model Card for Granite-7b-redhat-lab

### Overview
Granite-7b-redhat-lab is an instruction-tuned LAB model built via InstructLab, based on Granite-7b-base.

### Method
LAB: **L**arge-scale **A**lignment for chat**B**ots is a novel synthetic data-based alignment tuning method for LLMs from IBM Research.

## Model description
- **Model Name**: Granite-7b-redhat-lab
- **Language(s):** Primarily English
- **License:** Apache 2.0
- **Base model:** ibm/granite-7b-base
- **Teacher Model:** mistralai/Mixtral-8x7B-Instruct-v0.1
`,
  },
  {
    id: 'granite-8b-starter-v1',
    name: 'RedHatAI/granite-8b-starter-v1',
    category: 'redhat',
    provider: 'Red Hat',
    license: 'Apache 2.0',
    task: ['text-generation'],
    language: ['en'],
    description: 'Base model for customizing and fine-tuning with InstructLab.',
    createdAt: '2025-02-10',
    updatedAt: '2025-02-10',
    metrics: { accuracy: 84, quality: 86 },
  },
  {
    id: 'granite-8b-lab-v1',
    name: 'RedHatAI/granite-8b-lab-v1',
    category: 'redhat',
    provider: 'Red Hat',
    license: 'Apache 2.0',
    task: ['text-generation'],
    language: ['en'],
    description: 'Granite model for inference serving, an instruction-tuned LAB model.',
    createdAt: '2025-02-10',
    updatedAt: '2025-02-10',
    metrics: { accuracy: 86, quality: 88 },
  },
  {
    id: 'granite-3.1-8b-lab-v1',
    name: 'RedHatAI/granite-3.1-8b-lab-v1',
    category: 'redhat',
    provider: 'Red Hat',
    license: 'Apache 2.0',
    task: ['text-generation'],
    language: ['en'],
    description: 'Version 1 of the Granite 3.1 model for inference serving.',
    createdAt: '2025-02-10',
    updatedAt: '2025-02-10',
    metrics: { accuracy: 87, quality: 89 },
  },
  {
    id: 'granite-8b-code-instruct',
    name: 'RedHatAI/granite-8b-code-instruct',
    category: 'redhat',
    provider: 'Red Hat',
    license: 'Apache 2.0',
    task: ['code-generation', 'text-generation'],
    language: ['en'],
    description: 'LAB fine-tuned granite code model for inference serving.',
    createdAt: '2025-02-10',
    updatedAt: '2025-02-10',
    metrics: { accuracy: 88, quality: 90 },
    modelCard: `# Granite-8B-Code-Instruct-4K

## Model Summary
**Granite-8B-Code-Instruct-4K** is a 8B parameter model fine tuned from *Granite-8B-Code-Base-4K* on a combination of **permissively licensed** instruction data to enhance instruction following capabilities including logical reasoning and problem-solving skills.

- **Developers:** IBM Research
- **GitHub Repository:** ibm-granite/granite-code-models
- **Release Date**: May 6th, 2024
- **License:** Apache 2.0

## Usage
### Intended use
The model is designed to respond to coding related instructions and can be used to build coding assistants.
`,
  },
  {
    id: 'granite-8b-code-base',
    name: 'RedHatAI/granite-8b-code-base',
    category: 'redhat',
    provider: 'Red Hat',
    license: 'Apache 2.0',
    task: ['code-generation'],
    language: ['en'],
    description: 'Granite code model for inference serving, trained on 116 programming languages.',
    createdAt: '2025-02-10',
    updatedAt: '2025-02-10',
    metrics: { accuracy: 85, quality: 87 },
  },
  {
    id: 'prometheus-8x7b-v2-0',
    name: 'RedHatAI/prometheus-8x7b-v2-0',
    category: 'redhat',
    provider: 'Red Hat',
    license: 'Apache 2.0',
    task: ['text-generation'],
    language: ['en'],
    description: 'Prometheus 2 is an alternative of GPT-4 evaluation when doing fine-grained evaluation of any LLM.',
    createdAt: '2025-03-27',
    updatedAt: '2025-03-27',
    metrics: { accuracy: 90, quality: 91 },
    modelCard: `# Prometheus 2

## TL;DR
Prometheus 2 is an alternative of GPT-4 evaluation when doing fine-grained evaluation of an underlying LLM & a Reward model for Reinforcement Learning from Human Feedback (RLHF).

## Model Details
- **Model type:** Language model
- **Language(s) (NLP):** English
- **License:** Apache 2.0
- **Related Models:** All Prometheus Checkpoints

Prometheus is trained with two different sizes (7B and 8x7B).
`,
  },

  // Community and custom models (category: 'other')
  {
    id: 'vicuna-13b-v1.5',
    name: 'lmsys/Vicuna-13B-v1.5',
    category: 'other',
    provider: 'LMSYS',
    license: 'Llama 2 Community License',
    task: ['text-generation', 'question-answering'],
    language: ['en'],
    description: 'Vicuna is a chat assistant trained by fine-tuning LLaMA on user-shared conversations.',
    createdAt: '2023-07-29',
    updatedAt: '2025-01-28',
    metrics: { accuracy: 84, quality: 86 },
    modelCard: `# Vicuna-13B-v1.5

## Model Description
Vicuna is an open-source chatbot trained by fine-tuning LLaMA on user-shared conversations collected from ShareGPT.

## Intended Use
- Conversational AI
- Chat applications
- Research and development

## Limitations
- May reproduce biases from training data
- Not suitable for high-stakes applications
`,
  },
  {
    id: 'wizardcoder-15b-v1.0',
    name: 'WizardLM/WizardCoder-15B-V1.0',
    category: 'other',
    provider: 'WizardLM',
    license: 'BigCode OpenRAIL-M',
    task: ['code-generation', 'text-generation'],
    language: ['en'],
    description: 'WizardCoder is a code generation model fine-tuned with Evol-Instruct.',
    createdAt: '2023-06-15',
    updatedAt: '2025-01-27',
    metrics: { accuracy: 86, quality: 88 },
  },
  {
    id: 'codegen2.5-7b-multi',
    name: 'Salesforce/CodeGen2.5-7B-multi',
    category: 'other',
    provider: 'Salesforce',
    license: 'Apache 2.0',
    task: ['code-generation'],
    language: ['en', 'multilingual'],
    description: 'CodeGen2.5 is an autoregressive language model for program synthesis.',
    createdAt: '2023-07-14',
    updatedAt: '2025-01-26',
    metrics: { accuracy: 83, quality: 85 },
  },
  {
    id: 'falcon-7b-instruct',
    name: 'tiiuae/Falcon-7B-Instruct',
    category: 'other',
    provider: 'TII',
    license: 'Apache 2.0',
    task: ['text-generation'],
    language: ['en'],
    description: 'Falcon-7B-Instruct is a 7B parameters causal decoder-only model.',
    createdAt: '2023-06-05',
    updatedAt: '2025-01-25',
    metrics: { accuracy: 82, quality: 84 },
  },
  {
    id: 'stablelm-zephyr-3b',
    name: 'stabilityai/StableLM-Zephyr-3B',
    category: 'other',
    provider: 'Stability AI',
    license: 'StabilityAI Non-Commercial Research License',
    task: ['text-generation', 'question-answering'],
    language: ['en'],
    description: 'StableLM Zephyr 3B is a lightweight chat model optimized for instruction following.',
    createdAt: '2023-11-29',
    updatedAt: '2025-01-24',
    metrics: { accuracy: 80, quality: 82 },
  },
];
