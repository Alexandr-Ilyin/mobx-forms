export interface IInitKeScreenDiffOptions {
  appPrefix: string;
  screenComparerUrl: string;
}

export interface IRunKeTestsOptions extends IInitKeScreenDiffOptions {
  asyncLoadedScripts: string[];
}
