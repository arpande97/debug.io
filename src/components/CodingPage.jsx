"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const questions = [
  {
    id: "zookeeper-1",
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    example: "Input: nums = [2,7,11,15], target = 9 \nOutput: [0,1]",
    difficulty: "Easy",
  },
  {
    id: 2,
    title: "Reverse String",
    description: "Write a function that reverses a string.",
    example: "Input: s = 'hello'\nOutput: 'olleh'",
    difficulty: "Hard",
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    description: "Find the length of the longest substring without repeating characters.",
    example: "Input: s = 'abcabcbb'\nOutput: 3",
    difficulty: "Medium",
  },
];

const CodingPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const openModal = (question) => {
    setCurrentQuestion(question);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="relative w-screen">

      <div className="p-6 flex justify-center">
        <div className="w-full max-w-3xl bg-gray-50 border border-gray-300 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold p-4 border-b border-gray-300 bg-gray-100">
            Questions
          </h2>
          <ul className="divide-y divide-gray-300">
            {questions.map((question, index) => (
              <li
                key={question.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                }`}
              >

                <span>
                                    {index + 1}. {question.title}
                              </span>
                <div className={'flex-between gap-3'}>
                                  <span
                                    className={`inline-block py-0.5 px-2 text-sm font-medium rounded-full 
                                            ${question.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                                      question.difficulty === 'Medium' ? 'bg-yellow-500 text-white' :
                                        'bg-red-500 text-white'}`}
                                  >
                                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                              </span>



                  <button
                    onClick={() => openModal(question)}
                    className="text-sm px-3 py-1 rounded bg-blue-500 text-white hover:bg-gray-100 black_btn"
                  >
                    Description
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>


      {isModalOpen && currentQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-11/12 max-w-lg p-6 rounded shadow-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">{currentQuestion.title}</h2>
            <p>{currentQuestion.description}</p>
            <pre className="bg-gray-100 p-4 mt-4 rounded">
                            {currentQuestion.example}
                      </pre>


            <div className="mt-6 flex justify-end">
              {/*<Link href={`/solve/terminal-operations?id=${currentQuestion.id}`} target="_blank">*/}
              <Link href={`/solve/terminal-operations`} target="_blank">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Solve
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingPage;