---
layout: post
title: "Introduction to Classification"
description: "My Thesis pt. 1"
category: thesis
tags: [thesis]
---
{% include JB/setup %}

## Classification
Humans like to classify things. It's what we do. We either like things, like the Yankees and the Eagles, or we dislike things, like the Red Sox and the Cowboys. That email offering you a big payout if you'll only send money to Nigeria is either spam, or it's not (it probably is...). Sometimes, though, we don't have the time (or the ability) to classify all of the things we want to classify. We'd much rather have a spam filter determine whether that incoming email is spam and delete it for us than have to look and decide for ourselves. Here's a more serious example: a good deal of research in computational biology is going into investigating whether we can predict how well a patient will respond to a given cancer treatment based on their genes -- that is, given a patient's DNA sequence, will they respond well or not to this treatment? This is a vitally important question, because many treatments are destructive for the patient and we'd really like to avoid having patients go through treatments that are unlikely to work. This boils down to a classification problem that we, as humans, are actually incapable of solving. There is no expert who can look at a sequence of A's, C's, G's, and T's, and decide how the patient will respond to treatment. Further we don't even know if there is enough information available in the genome to really answer the question. The machine learning community has been working on problems like these for years and have developed numerous algorithms, that we call learning algorithms or learners, to perform classification automatically.

When formulating a classification problem, we often talk about *features* and *labels*. Features are roughly equivalent to variables  -- they are defining aspects of a given example. If we are trying to determine whether or not it will rain, whether or not it is cloudy might be a feature. The temperature might be a feature. The month might be a feature. Anything that might impact the classification can be used as a feature. Labels are the true class of a given example. In a weather classification problem, given a set of features (cloudy, 80 degrees, March), the label would be whether or not it rained. Then each example can be considered a vector of its features and its label. Say we'd been gathering data for three days -- each of these days would translate to one example, so we'd have three vectors:

*    \[cloudy, 80, March, rainy\]
*    \[clear, 50, March, sunny\]
*    \[clear, 70, March, rainy\]

In general, learning algorithms take as input a set of training examples (where each example is represented by its feature vector) and build a hypothesis about how to make classifications of unseen examples based off of the available training data.
There are three main types of classifiers, as defined by how much information the training data has:

*    Supervised Learning -- the label of each training example is known
*    Semi-Supervised Learning -- some labels are known
*    Unsupervised Learning -- no labels are known

As we'll get into a bit later, my research involves supervised learning.

Machine learning researchers have developed quite a few supervised learning algorithms, and I'll touch on a few of them.

*    #### Support Vector Machines
     [SVMs][svm] are binary classifiers that treat the training examples as points in a hyper-dimensional space, where each feature corresponds to one axis. They construct a hyperplane that separates the two classes from each other by maximizing the margin between the two classes. Interestingly, SVMs make use of what are known as kernel functions, which map the original feature space to a higher dimension and can capture non-linear relationships among features. Fitting an SVM to the training data involves solving a quadratic problem and is generally considered hard, but once an SVM is trained, classifying a new example is very fast, as it involves calculating only one dot product.
     [svm]: http://link.springer.com/article/10.1007%2FBF00994018

*    #### K-Nearest Neighbors
     The [K-Nearest Neighbor][knn] algorithm is a conceptually simple algorithm that performs surprisingly well. The algorithm's fundamental assumption is that examples of the same class will be clustered close to each other. Given that assumption, the algorithm is very simple: find the k closest neighbors to the new example (where close refers to distance in terms of the Euclidean distance in the feature space), and give each neighbor a vote, where the vote is simply what class that neighbor is a member of. The class with the most votes wins. When implemented naively, it is a simple algorithm that takes little-to-no time to train (since it requires only storing each training example) but a long time to classify new examples (since it requires a linear search through the training examples to identify the k nearest neighbors). A number of data structures have been proposed to shorten the classification time at the cost of a longer training time.
     [knn]: http://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm

*    #### Decision Trees
     TODO

*    #### Naive Bayes
     TODO

Each of these algorithms (and the many others that exist) have their benefits and their drawbacks, and they are generally all prone to overfitting to the training data. Additionally, many of them grow more and more complex in terms of time and space as the number of features increases, so we'd often like to reduce the number of features used by a given classifier. This realization leads us directly to the topic of feature selection, which I hope to cover in my next post.
