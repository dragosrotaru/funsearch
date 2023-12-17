export class LLM {
  constructor(private samplesPerPrompt: number) {}

  private drawSample(prompt: string): string {
    throw new Error("Must provide a language model.");
  }

  drawSamples(prompt: string): string[] {
    const samples: string[] = [];
    for (let i = 0; i < this.samplesPerPrompt; i++) {
      samples.push(this.drawSample(prompt));
    }
    return samples;
  }
}
