# Repository Audit Checklist — stabgan

## Priority 1: High-Star Repos (6+ stars)
- [x] `openrouter-mcp-multimodal` (17⭐) — ✅ Full rewrite, bug fixes, README, pushed
- [x] `Recurrent-Neural-Networks-to-predict-Google-Stock-Price` (15⭐) — ✅ Fixed keras→tf.keras, data leakage, hardcoded paths
- [x] `Multiple-Linear-Regression` (10⭐) — ✅ Fixed cross_validation, OneHotEncoder→ColumnTransformer
- [x] `Linear-Discriminant-Analysis` (9⭐) — ✅ Fixed color indexing bug, refactored viz
- [x] `LSTM-using-pyTorch` (8⭐) — ✅ Fixed Variable, loss.data[0], added device handling
- [x] `Upper-Confidence-Bounds` (7⭐) — ✅ Fixed 1e400→math.inf, histogram bins
- [x] `GANs-using-pyTorch-from-Scratch` (6⭐) — ✅ Fixed Variable, Scale→Resize, loss.data[0]
- [x] `saaki` (6⭐) — ✅ Fixed ID leakage, NaN handling, cleaned requirements.txt

## Priority 2: Medium-Star Repos (2-5 stars)
- [x] `Autoencoder-using-pyTorch` (5⭐) — ✅ Fixed Variable, loss.data[0], require_grad typo, missing zero_grad
- [x] `Polynomial-Regression` (5⭐) — ✅ Fixed predict scalar→2D array
- [x] `Virtual-Self-Driving-Car-AI-using-Kivy-and-Reinforcement-Learning` (5⭐) — ✅ Fixed Variable, volatile, softmax dim, global bug
- [x] `Thompson-Sampling` (4⭐) — ✅ Fixed imports, paths, added __main__ guard
- [x] `Hierarchical-clustering` (3⭐) — ✅ Fixed affinity→metric, removed stale imports
- [x] `Boltzmann-Machines-using-pyTorch` (2⭐) — ✅ Fixed Variable, .item(), unused imports
- [x] `Feed-Forward-Neural-Network-in-pyTorch` (2⭐) — ✅ Fixed Variable, loss.data[0], iter shadowing
- [x] `Support-Vector-Regression` (2⭐) — ✅ Fixed 2D input for predict/transform
- [x] `Training-a-Breakout-AI-using-OpenAI-gym-environment` (2⭐) — ✅ Fixed Variable, gym→gymnasium, clip_grad_norm_
- [x] `ipynb_to_pdf` (2⭐) — ✅ Fixed crash bugs, removed committed venv, added .gitignore

## Priority 3: 1-Star Repos
- [x] `stabgan.github.io` (1⭐) — ✅ README rewritten
- [x] `icd10cm` (1⭐) — ✅ Fixed regex injection, MongoDB leak, hardcoded URLs, XSS
- [x] `ICD-10-CM-code-April-2025-CSV-FILE-ENHANCED` (1⭐) — ✅ Fixed broken paths, modernized Python
- [x] `biogemma` (1⭐) — ✅ README rewritten (no code in repo)
- [x] `quant-v1-trial` (1⭐) — ✅ Fixed 11 bugs (searchParams, Prisma, CSS vars, etc.)
- [x] `Advanced-Data-Profile` (1⭐) — ✅ Fixed 8 bugs (variable shadowing, deprecated APIs)
- [x] `NYC_Yellow_Taxi_Analysis_Dashboard` (1⭐) — ✅ Fixed hardcoded DB creds, Spark session, dtype checks
- [x] `Final-Project-Mtech` (1⭐) — ✅ README rewritten
- [x] `ANN-on-Churn-Modelling-Dataset-using-Keras` (1⭐) — ✅ Fixed keras→tf.keras, OneHotEncoder, scikeras
- [x] `CNN-classification-of-MNIST-dataset-using-pyTorch` (1⭐) — ✅ Fixed Variable, loss.data[0], eval mode
- [x] `Object-Detection-using-Single-Shot-Detection` (1⭐) — ✅ Fixed Variable, volatile, 8 files modernized
- [x] `K-Nearest-Neighbours` (1⭐) — ✅ Fixed cross_validation, scatter colors
- [x] `Kernel-Support-Vector-Machine` (1⭐) — ✅ Fixed cross_validation
- [x] `Support-Vector-Machine` (1⭐) — ✅ Fixed scatter colors, refactored viz
- [x] `XGBoost` (1⭐) — ✅ Fixed OneHotEncoder, R CV bug (training_set→training_fold)
- [x] `Principle-Component-Analysis` (1⭐) — ✅ Fixed ListedColormap, added solver/max_iter
- [x] `Binary-Sentiment-Analysis` (1⭐) — ✅ Fixed cross_validation, hardcoded range, added reports
- [x] `Binary-Search-Tree-and-tree-sort-from-Scratch-in-Java` (1⭐) — ✅ Fixed postorder bug, duplicate class
- [x] `Concurrent-FTP-Distributed-Math-Server` (1⭐) — ✅ Fixed Python 2→3, socket encoding
- [x] `Parrot-Chatbot` (1⭐) — ✅ Fixed deprecated request→fetch, body-parser, Graph API v21
- [x] `OpenAI-Gym-Doom-AI-Reinforcement-Learning` (1⭐) — ✅ Fixed Variable, gym→gymnasium, scipy.misc
- [x] `MCT` (1⭐) — ✅ Already had good README
- [x] `blockbreakergame` (1⭐) — ✅ README rewritten
- [x] `guessgame` (1⭐) — ✅ README rewritten
- [x] `tower-of-hanoi-webapp` (1⭐) — ✅ README rewritten
- [x] `kglecmptns` (1⭐) — ⏭️ Empty repo, skipped

## Priority 4: 0-Star Repos
- [x] `Algorithmic-Toolbox` — ✅ README + .gitignore added
- [x] `Angular-Components-Data-Binding` — ✅ README rewritten
- [x] `Apriori` — ✅ Fixed hardcoded rows/cols, nan filtering, added formatting
- [x] `Cartpole-AI` — ✅ Fixed gym→gymnasium, Adam lr, env.reset/step API
- [x] `Client-Server-FTP` — ✅ Fixed Python 2→3, encoding, error handling
- [x] `Convolutional-Neural-Network-using-Keras` — ✅ Fixed keras→tf.keras, fit_generator→fit
- [x] `Decision-Tree-Classification` — ✅ Fixed cross_validation
- [x] `Decision-Tree-Regression` — ✅ Fixed predict scalar→2D
- [x] `Drawing-Tree-with-python` — ✅ Fixed broken geometry, recursion
- [x] `Eclat` — ✅ Fixed redundant read.csv, modernized R style
- [x] `FastText-Sentence2Vec` — ✅ Fixed 10 files (notebook, C++, eval.py)
- [x] `Generic-Linked-List-Class-from-Scratch-in-Java` — ✅ Fixed generics, NPE, exceptions
- [x] `Guess-The-Word-Game` — ✅ Fixed flag bug, IndexError, input validation
- [x] `HaarFacialRecognition` — ✅ Fixed cascade paths, frame validation
- [x] `HTML-canvas-ball-bounce` — ✅ README rewritten
- [x] `Ionic-VanillaJS-Rating-App` — ✅ README rewritten
- [x] `K-Means-Clustering` — ✅ Fixed cross_validation
- [x] `Kernel-PCA` — ✅ Fixed ListedColormap scatter pattern
- [x] `Linear-Regression-with-pyTorch` — ✅ Fixed Variable, loss.data[0], cuda handling
- [x] `Logistic-Regression` — ✅ Fixed cross_validation, ListedColormap, added solver
- [x] `Minimalistic-HTML-Template` — ✅ README rewritten
- [x] `Modified-MNIST-2-digit-classification-at-once-using-pyTorch` — ✅ Fixed optimizer, loss.data, eval mode
- [x] `Naive-Bayes` — ✅ Fixed ListedColormap, R plot titles, duplicate imports
- [x] `Random-Forest-Classification` — ✅ Fixed scatter colors, added classification_report
- [x] `Random-Forest-Regression` — ✅ Fixed predict scalar→2D, bumped n_estimators
- [x] `Recognition-of-Hand-Written-Digits-MNIST-from-Scratch` — ✅ Fixed np.bool, dual='auto', .pyc cleanup
- [x] `Recurrent-Neural-Network-using-pyTorch` — ✅ Fixed Variable, loss.data[0], eval mode
- [x] `Self-Organizing-Maps-using-miniSOM` — ✅ Fixed pylab→pyplot, hardcoded coords→dynamic
- [x] `Sentiment-Analysis-from-Scratch` — ✅ Fixed Python 2 compat, dead code, file handles
- [x] `Simple-Linear-Regression` — ✅ Fixed cross_validation, duplicate R import
- [x] `Smile-Detector` — ✅ Fixed cascade paths, frame validation, webcam check
- [x] `logistic-regression-with-pyTorch` — ✅ Fixed Variable, loss.data[0], cuda guard
- [x] `neural-network-backpropagation-algorithm-from-scratch` — ✅ Fixed 7 bugs (missing numpy, broken backprop)
- [x] `pong-game-kivy` — ✅ Fixed scoring boundary, added random serve
- [x] `tkinter-drawing-app` — ✅ Fixed coord truthiness, color picker crash
- [x] `stabgan.github.io` — ✅ README rewritten

## Skipped
- `kglecmptns` — empty repo
- `Applied-Time-Series-Analysis-MTECH-1st-term` — empty/notes
- `Gatsby-forestry-trial`, `JAVA-AWT-Experiment-1`, `KAMS`, `TSA-Assignments-notebooks` — experiments/dumps
- `base17-to-decimal`, `chatgpt_unofficial_privacy_policy`, `ipynb_dumps`, `markdowntest`, `public_pdf` — tiny/meta
- `Limitless-Calculator-License`, `Pandas-Data-Wrangling-advanced`, `Random-Name-Generators` — practice/fun
- `RemixFBQuotes`, `RemixRubiks`, `google_colab_sheets`, `whale`, `demongame` — incomplete/no source
- `html-pacman`, `html-paint`, `pure-js-mini-game`, `rails-game` — tiny games
- `aima-website-1` through `aima-website-8` — AIMA showcase sites
- `Anagram-Android-App`, `Analysis_Solar_1`, `BST-Guesser-App`, `Scarne-Dice` — Android/notebook
- `Touring-Musician-Android-App`, `Word-Stacks` — Android Java
- `stabgan` — profile README (handled separately)
- `Java-implementation-of-Bidirectional-Circular-Linked-List-from-scratch-for-storing-2D-points` — Java
