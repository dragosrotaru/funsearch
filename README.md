# Funsearch-ts

Python lacks homoiconicity and first class functions, making it hard to generalize the Funsearch system.
What I mean by generalize, is to incorporate the hyperparameters and source code of the model itself into the search space.

The point of curiosity is, what does a meta-circular AI look like?

This is why I want to combine the basic Funseach concept with my custom Lisp program human-ai programming symbiosis experiment: https://github.com/dragosrotaru/PAL.git

In Pal, an LLM is embedded as a special form in the language and the evaluator has read/write access to its own source code. Every object in memory is automatically mapped to the filesystem namespace,
And file extensions are 1:1 mapped with the TypeSystem. Additionally, any data/code structure has a 1:1 representation as a web page.

The entire environment of the Program is 1:1 mapped with the FileSystem.

You could imagine a stack of these systems, where System 0 explores the solution space of concrete verifiable/ easy to evaluatate problem,
System 1 explores the problem space of System 0 (the space of problems with easy to evaluate problems), System 2 explores the space of hyperparameters,
System 3 explores the space of evaluators, System 4 explores the space of languages, the space of problem skeletons, the space of LLMs, the space of tuning LLMs, and so on.

Each level could receive a reward signal because there is a base System 0, which receives a score based on the solution to concrete problems.
This level of generalizability is possible if you have the ability for the entire system to introspect.

I also anticipate that a big part of the solution space is defining new languages to begin with. A generalized system could develop its own language dialects
which are most efficient for solving specific subsets of problems. These could be automatically catalogued in a language space. Which is why I believe homoiconic
languages would generally fare better at generalizing to problem solving, due to their ability to compact well. 

## Safety

Deno provides security/sandboxing built in.
I also think you can use a sort of git versioning with human in the loop doing code reviews
of the source code as the system evolves. 

