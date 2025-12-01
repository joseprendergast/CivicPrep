import { storage } from "../storage";
import { InsertQuestion, QuestionOption } from "@shared/schema";
import fs from "fs";
import path from "path";

// Parse and load questions from the USCIS 100 questions
export async function loadQuestions() {
  try {
    const questions = await storage.getQuestions();
    
    // Only load questions if none exist
    if (questions.length === 0) {
      console.log("Loading questions into database...");
      await loadUSCISQuestions();
      console.log("Questions loaded successfully!");
    } else {
      console.log(`${questions.length} questions already loaded.`);
    }
  } catch (error) {
    console.error("Error loading questions:", error);
    throw error;
  }
}

// Location-specific data for Weehawken, NJ
const locationData = {
  governor: "Phil Murphy",
  senators: ["Bob Menendez", "Cory Booker"],
  representative: "Rob Menendez (NJ-8)",
  capital: "Trenton"
};

// Function to load the USCIS questions from the content
async function loadUSCISQuestions() {
  // Categories in the USCIS content
  const categories = {
    "AMERICAN GOVERNMENT": {
      "A: Principles of American Democracy": [1, 12],
      "B: System of Government": [13, 47], 
      "C: Rights and Responsibilities": [48, 57]
    },
    "AMERICAN HISTORY": {
      "A: Colonial Period and Independence": [58, 68],
      "B: 1800s": [69, 79],
      "C: Recent American History and Other Important Historical Information": [80, 100]
    },
    "INTEGRATED CIVICS": {
      "A: Geography": [88, 94],
      "B: Symbols": [95, 97],
      "C: Holidays": [98, 100]
    }
  };

  // Define questions and their multiple-choice options
  const questionsData: InsertQuestion[] = [
    {
      questionNumber: 1,
      text: "What is the supreme law of the land?",
      correctAnswer: "the Constitution",
      category: "AMERICAN GOVERNMENT",
      subcategory: "A: Principles of American Democracy",
      options: createOptions([
        { text: "the Constitution", isCorrect: true },
        { text: "the Declaration of Independence", isCorrect: false },
        { text: "the Bill of Rights", isCorrect: false },
        { text: "Federal laws", isCorrect: false }
      ]),
      explanation: "The Constitution is the supreme law of the land. It establishes the framework of the federal government.",
      isLocationSpecific: false
    },
    {
      questionNumber: 2,
      text: "What does the Constitution do?",
      correctAnswer: "sets up the government, defines the government, protects basic rights of Americans",
      category: "AMERICAN GOVERNMENT",
      subcategory: "A: Principles of American Democracy",
      options: createOptions([
        { text: "sets up the government", isCorrect: true },
        { text: "declares independence from Great Britain", isCorrect: false },
        { text: "establishes state borders", isCorrect: false },
        { text: "creates political parties", isCorrect: false }
      ]),
      explanation: "The Constitution sets up the government, defines the government, and protects the basic rights of Americans.",
      isLocationSpecific: false
    },
    {
      questionNumber: 3,
      text: "The idea of self-government is in the first three words of the Constitution. What are these words?",
      correctAnswer: "We the People",
      category: "AMERICAN GOVERNMENT",
      subcategory: "A: Principles of American Democracy",
      options: createOptions([
        { text: "We the People", isCorrect: true },
        { text: "United States Constitution", isCorrect: false },
        { text: "Liberty and Justice", isCorrect: false },
        { text: "Life, Liberty, Happiness", isCorrect: false }
      ]),
      explanation: "The first three words of the Constitution are 'We the People,' which emphasizes that the government is established by the people.",
      isLocationSpecific: false
    },
    {
      questionNumber: 4,
      text: "What is an amendment?",
      correctAnswer: "a change to the Constitution, an addition to the Constitution",
      category: "AMERICAN GOVERNMENT",
      subcategory: "A: Principles of American Democracy",
      options: createOptions([
        { text: "a change to the Constitution", isCorrect: true },
        { text: "a government official", isCorrect: false },
        { text: "a new law passed by Congress", isCorrect: false },
        { text: "a presidential decree", isCorrect: false }
      ]),
      explanation: "An amendment is a change or addition to the Constitution.",
      isLocationSpecific: false
    },
    {
      questionNumber: 5,
      text: "What do we call the first ten amendments to the Constitution?",
      correctAnswer: "the Bill of Rights",
      category: "AMERICAN GOVERNMENT",
      subcategory: "A: Principles of American Democracy",
      options: createOptions([
        { text: "the Bill of Rights", isCorrect: true },
        { text: "the Declaration of Rights", isCorrect: false },
        { text: "the Constitutional Rights", isCorrect: false },
        { text: "the American Freedoms", isCorrect: false }
      ]),
      explanation: "The first ten amendments to the Constitution are called the Bill of Rights.",
      isLocationSpecific: false
    },
    {
      questionNumber: 6,
      text: "What is one right or freedom from the First Amendment?",
      correctAnswer: "speech, religion, assembly, press, petition the government",
      category: "AMERICAN GOVERNMENT",
      subcategory: "A: Principles of American Democracy",
      options: createOptions([
        { text: "freedom of speech", isCorrect: true },
        { text: "right to bear arms", isCorrect: false },
        { text: "right to a speedy trial", isCorrect: false },
        { text: "freedom from unreasonable searches", isCorrect: false }
      ]),
      explanation: "The First Amendment protects freedom of speech, religion, assembly, press, and the right to petition the government.",
      isLocationSpecific: false
    },
    // Generate more questions here...
    {
      questionNumber: 20,
      text: "Who is one of your state's U.S. Senators now?",
      correctAnswer: "Bob Menendez, Cory Booker",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "Bob Menendez", isCorrect: true },
        { text: "Cory Booker", isCorrect: true },
        { text: "Chris Christie", isCorrect: false },
        { text: "Phil Murphy", isCorrect: false }
      ]),
      explanation: "New Jersey is represented by Senators Bob Menendez and Cory Booker in the U.S. Senate.",
      isLocationSpecific: true,
      locationState: "New Jersey"
    },
    {
      questionNumber: 23,
      text: "Name your U.S. Representative.",
      correctAnswer: "Rob Menendez",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "Rob Menendez", isCorrect: true },
        { text: "Albio Sires", isCorrect: false },
        { text: "Bill Pascrell", isCorrect: false },
        { text: "Josh Gottheimer", isCorrect: false }
      ]),
      explanation: "Weehawken, NJ is in the 8th Congressional District, represented by Rob Menendez.",
      isLocationSpecific: true,
      locationState: "New Jersey",
      locationCity: "Weehawken"
    },
    {
      questionNumber: 43,
      text: "Who is the Governor of your state now?",
      correctAnswer: "Phil Murphy",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "Phil Murphy", isCorrect: true },
        { text: "Chris Christie", isCorrect: false },
        { text: "Jon Corzine", isCorrect: false },
        { text: "Robert Menendez", isCorrect: false }
      ]),
      explanation: "Phil Murphy is the Governor of New Jersey.",
      isLocationSpecific: true,
      locationState: "New Jersey"
    },
    {
      questionNumber: 44,
      text: "What is the capital of your state?",
      correctAnswer: "Trenton",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "Trenton", isCorrect: true },
        { text: "Newark", isCorrect: false },
        { text: "Jersey City", isCorrect: false },
        { text: "Princeton", isCorrect: false }
      ]),
      explanation: "The capital of New Jersey is Trenton.",
      isLocationSpecific: true,
      locationState: "New Jersey"
    }
  ];

  // Add the remaining USCIS questions for all 100 questions challenge
  const sampleQuestions = [
    {
      questionNumber: 8,
      text: "What did the Declaration of Independence do?",
      correctAnswer: "announced our independence from Great Britain",
      category: "AMERICAN GOVERNMENT",
      subcategory: "A: Principles of American Democracy",
      options: createOptions([
        { text: "announced our independence from Great Britain", isCorrect: true },
        { text: "established the first U.S. Congress", isCorrect: false },
        { text: "created the Constitution", isCorrect: false },
        { text: "ended the Civil War", isCorrect: false }
      ]),
      explanation: "The Declaration of Independence announced our independence from Great Britain.",
      isLocationSpecific: false
    },
    {
      questionNumber: 13,
      text: "Name one branch or part of the government.",
      correctAnswer: "Congress, legislative, President, executive, the courts, judicial",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "legislative branch (Congress)", isCorrect: true },
        { text: "executive branch (President)", isCorrect: true },
        { text: "judicial branch (the courts)", isCorrect: true },
        { text: "Department of Defense", isCorrect: false },
        { text: "Federal Bureau of Investigation", isCorrect: false }
      ]),
      explanation: "The three branches of government are legislative (Congress), executive (President), and judicial (the courts).",
      isLocationSpecific: false
    },
    {
      questionNumber: 16,
      text: "Who makes federal laws?",
      correctAnswer: "Congress, Senate and House (of Representatives), (U.S. or national) legislature",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "Congress (Senate and House of Representatives)", isCorrect: true },
        { text: "the President", isCorrect: false },
        { text: "the Supreme Court", isCorrect: false },
        { text: "state governments", isCorrect: false }
      ]),
      explanation: "Congress, which consists of the Senate and House of Representatives, makes federal laws.",
      isLocationSpecific: false
    },
    {
      questionNumber: 55,
      text: "What are two ways that Americans can participate in their democracy?",
      correctAnswer: "vote, join a political party, help with a campaign, join a civic group, join a community group, give an elected official your opinion on an issue, call Senators and Representatives, publicly support or oppose an issue or policy, run for office, write to a newspaper",
      category: "AMERICAN GOVERNMENT",
      subcategory: "C: Rights and Responsibilities",
      options: createOptions([
        { text: "vote and join a political party", isCorrect: true },
        { text: "pay taxes and serve on a jury", isCorrect: false },
        { text: "buy American products and salute the flag", isCorrect: false },
        { text: "protest and block traffic", isCorrect: false }
      ]),
      explanation: "Americans can participate in their democracy by voting, joining political parties, helping with campaigns, contacting elected officials, and more.",
      isLocationSpecific: false
    },
    {
      questionNumber: 65,
      text: "What happened at the Constitutional Convention?",
      correctAnswer: "The Constitution was written, The Founding Fathers wrote the Constitution",
      category: "AMERICAN HISTORY",
      subcategory: "A: Colonial Period and Independence",
      options: createOptions([
        { text: "The Constitution was written", isCorrect: true },
        { text: "The Declaration of Independence was signed", isCorrect: false },
        { text: "The Revolutionary War ended", isCorrect: false },
        { text: "George Washington was elected president", isCorrect: false }
      ]),
      explanation: "At the Constitutional Convention, the Founding Fathers wrote the Constitution.",
      isLocationSpecific: false
    },
    {
      questionNumber: 70,
      text: "What was one important thing that Abraham Lincoln did?",
      correctAnswer: "freed the slaves (Emancipation Proclamation), saved (or preserved) the Union, led the United States during the Civil War",
      category: "AMERICAN HISTORY",
      subcategory: "B: 1800s",
      options: createOptions([
        { text: "freed the slaves (Emancipation Proclamation)", isCorrect: true },
        { text: "established the United Nations", isCorrect: false },
        { text: "purchased Alaska from Russia", isCorrect: false },
        { text: "ended World War I", isCorrect: false }
      ]),
      explanation: "Abraham Lincoln freed the slaves with the Emancipation Proclamation, preserved the Union, and led the U.S. during the Civil War.",
      isLocationSpecific: false
    },
    {
      questionNumber: 84,
      text: "What movement tried to end racial discrimination?",
      correctAnswer: "civil rights (movement)",
      category: "AMERICAN HISTORY",
      subcategory: "C: Recent American History and Other Important Historical Information",
      options: createOptions([
        { text: "civil rights movement", isCorrect: true },
        { text: "women's suffrage movement", isCorrect: false },
        { text: "labor movement", isCorrect: false },
        { text: "progressive movement", isCorrect: false }
      ]),
      explanation: "The civil rights movement tried to end racial discrimination in the United States.",
      isLocationSpecific: false
    },
    {
      questionNumber: 91,
      text: "Name one U.S. territory.",
      correctAnswer: "Puerto Rico, U.S. Virgin Islands, American Samoa, Northern Mariana Islands, Guam",
      category: "INTEGRATED CIVICS",
      subcategory: "A: Geography",
      options: createOptions([
        { text: "Puerto Rico", isCorrect: true },
        { text: "Hawaii", isCorrect: false },
        { text: "Alaska", isCorrect: false },
        { text: "Bahamas", isCorrect: false }
      ]),
      explanation: "U.S. territories include Puerto Rico, U.S. Virgin Islands, American Samoa, Northern Mariana Islands, and Guam.",
      isLocationSpecific: false
    },
    {
      questionNumber: 96,
      text: "Why does the flag have 13 stripes?",
      correctAnswer: "because there were 13 original colonies, because the stripes represent the original colonies",
      category: "INTEGRATED CIVICS",
      subcategory: "B: Symbols",
      options: createOptions([
        { text: "because there were 13 original colonies", isCorrect: true },
        { text: "because there were 13 original states", isCorrect: true },
        { text: "because there were 13 original presidents", isCorrect: false },
        { text: "because there were 13 original amendments", isCorrect: false }
      ]),
      explanation: "The flag has 13 stripes because there were 13 original colonies.",
      isLocationSpecific: false
    },
    {
      questionNumber: 21,
      text: "The House of Representatives has how many voting members?",
      correctAnswer: "four hundred thirty-five (435)",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "four hundred thirty-five (435)", isCorrect: true },
        { text: "one hundred (100)", isCorrect: false },
        { text: "fifty (50)", isCorrect: false },
        { text: "two hundred (200)", isCorrect: false }
      ]),
      explanation: "The House of Representatives has 435 voting members.",
      isLocationSpecific: false
    },
    {
      questionNumber: 22,
      text: "We elect a U.S. Representative for how many years?",
      correctAnswer: "two (2)",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "two (2)", isCorrect: true },
        { text: "four (4)", isCorrect: false },
        { text: "six (6)", isCorrect: false },
        { text: "eight (8)", isCorrect: false }
      ]),
      explanation: "U.S. Representatives are elected for two-year terms.",
      isLocationSpecific: false
    },
    {
      questionNumber: 24,
      text: "Who does a U.S. Senator represent?",
      correctAnswer: "all people of the state",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "all people of the state", isCorrect: true },
        { text: "only people in their political party", isCorrect: false },
        { text: "only the people who voted for them", isCorrect: false },
        { text: "only people in certain counties", isCorrect: false }
      ]),
      explanation: "A U.S. Senator represents all people of their state.",
      isLocationSpecific: false
    },
    {
      questionNumber: 25,
      text: "Why do some states have more Representatives than other states?",
      correctAnswer: "because of the state's population",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "because of the state's population", isCorrect: true },
        { text: "because of the state's size", isCorrect: false },
        { text: "because of the state's age", isCorrect: false },
        { text: "because of the state's wealth", isCorrect: false }
      ]),
      explanation: "States have different numbers of Representatives based on their population.",
      isLocationSpecific: false
    },
    {
      questionNumber: 26,
      text: "We elect a President for how many years?",
      correctAnswer: "four (4)",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "four (4)", isCorrect: true },
        { text: "two (2)", isCorrect: false },
        { text: "six (6)", isCorrect: false },
        { text: "eight (8)", isCorrect: false }
      ]),
      explanation: "We elect a President for a four-year term.",
      isLocationSpecific: false
    },
    {
      questionNumber: 27,
      text: "In what month do we vote for President?",
      correctAnswer: "November",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "November", isCorrect: true },
        { text: "January", isCorrect: false },
        { text: "October", isCorrect: false },
        { text: "December", isCorrect: false }
      ]),
      explanation: "Presidential elections are held in November.",
      isLocationSpecific: false
    },
    {
      questionNumber: 28,
      text: "What is the name of the President of the United States now?",
      correctAnswer: "Donald Trump",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "Joe Biden", isCorrect: false },
        { text: "Donald Trump", isCorrect: true },
        { text: "Barack Obama", isCorrect: false },
        { text: "Kamala Harris", isCorrect: false }
      ]),
      explanation: "Donald Trump is the current President of the United States.",
      isLocationSpecific: false
    },
    {
      questionNumber: 29,
      text: "What is the name of the Vice President of the United States now?",
      correctAnswer: "JD Vance", 
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "Kamala Harris", isCorrect: false },
        { text: "Mike Pence", isCorrect: false },
        { text: "Joe Biden", isCorrect: false },
        { text: "JD Vance", isCorrect: true }
      ]),
      explanation: "JD Vance is the current Vice President of the United States.",
      isLocationSpecific: false
    },
    {
      questionNumber: 30,
      text: "If the President can no longer serve, who becomes President?",
      correctAnswer: "the Vice President",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "the Vice President", isCorrect: true },
        { text: "the Speaker of the House", isCorrect: false },
        { text: "the Secretary of State", isCorrect: false },
        { text: "the Chief Justice", isCorrect: false }
      ]),
      explanation: "If the President can no longer serve, the Vice President becomes President.",
      isLocationSpecific: false
    },
    {
      questionNumber: 31,
      text: "If both the President and the Vice President can no longer serve, who becomes President?",
      correctAnswer: "the Speaker of the House",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "the Speaker of the House", isCorrect: true },
        { text: "the Secretary of State", isCorrect: false },
        { text: "the Chief Justice", isCorrect: false },
        { text: "the Secretary of Defense", isCorrect: false }
      ]),
      explanation: "If both the President and Vice President cannot serve, the Speaker of the House becomes President.",
      isLocationSpecific: false
    },
    {
      questionNumber: 32,
      text: "Who is the Commander in Chief of the military?",
      correctAnswer: "the President",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "the President", isCorrect: true },
        { text: "the Secretary of Defense", isCorrect: false },
        { text: "the Vice President", isCorrect: false },
        { text: "the General of the Army", isCorrect: false }
      ]),
      explanation: "The President is the Commander in Chief of the military.",
      isLocationSpecific: false
    },
    {
      questionNumber: 33,
      text: "Who signs bills to become laws?",
      correctAnswer: "the President",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "the President", isCorrect: true },
        { text: "the Vice President", isCorrect: false },
        { text: "the Speaker of the House", isCorrect: false },
        { text: "the Chief Justice", isCorrect: false }
      ]),
      explanation: "The President signs bills to become laws.",
      isLocationSpecific: false
    },
    {
      questionNumber: 34,
      text: "Who vetoes bills?",
      correctAnswer: "the President",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "the President", isCorrect: true },
        { text: "the Vice President", isCorrect: false },
        { text: "the Speaker of the House", isCorrect: false },
        { text: "the Chief Justice", isCorrect: false }
      ]),
      explanation: "The President has the power to veto bills.",
      isLocationSpecific: false
    },
    {
      questionNumber: 35,
      text: "What does the President's Cabinet do?",
      correctAnswer: "advises the President",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "advises the President", isCorrect: true },
        { text: "approves Supreme Court Justices", isCorrect: false },
        { text: "writes laws", isCorrect: false },
        { text: "approves treaties", isCorrect: false }
      ]),
      explanation: "The President's Cabinet advises the President on important issues.",
      isLocationSpecific: false
    },
    {
      questionNumber: 36,
      text: "What are two Cabinet-level positions?",
      correctAnswer: "Secretary of State, Secretary of Defense, Secretary of the Treasury",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "Secretary of State and Secretary of Defense", isCorrect: true },
        { text: "Speaker of the House and Senate Majority Leader", isCorrect: false },
        { text: "Chief Justice and Attorney General", isCorrect: false },
        { text: "National Security Advisor and White House Chief of Staff", isCorrect: false }
      ]),
      explanation: "Cabinet-level positions include the Secretary of State, Secretary of Defense, and others.",
      isLocationSpecific: false
    },
    {
      questionNumber: 37,
      text: "What does the judicial branch do?",
      correctAnswer: "reviews laws, explains laws, resolves disputes, decides if a law goes against the Constitution",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "reviews laws and decides if they are constitutional", isCorrect: true },
        { text: "writes and passes laws", isCorrect: false },
        { text: "enforces laws", isCorrect: false },
        { text: "approves the federal budget", isCorrect: false }
      ]),
      explanation: "The judicial branch reviews laws, explains laws, resolves disputes, and decides if laws violate the Constitution.",
      isLocationSpecific: false
    },
    {
      questionNumber: 38,
      text: "What is the highest court in the United States?",
      correctAnswer: "the Supreme Court",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "the Supreme Court", isCorrect: true },
        { text: "the Federal Circuit Court", isCorrect: false },
        { text: "the International Court of Justice", isCorrect: false },
        { text: "the District Court", isCorrect: false }
      ]),
      explanation: "The Supreme Court is the highest court in the United States.",
      isLocationSpecific: false
    },
    {
      questionNumber: 39,
      text: "How many justices are on the Supreme Court?",
      correctAnswer: "nine (9)",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "nine (9)", isCorrect: true },
        { text: "seven (7)", isCorrect: false },
        { text: "twelve (12)", isCorrect: false },
        { text: "five (5)", isCorrect: false }
      ]),
      explanation: "There are nine justices on the Supreme Court.",
      isLocationSpecific: false
    },
    {
      questionNumber: 40,
      text: "Who is the Chief Justice of the United States now?",
      correctAnswer: "John Roberts",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "John Roberts", isCorrect: true },
        { text: "Clarence Thomas", isCorrect: false },
        { text: "Samuel Alito", isCorrect: false },
        { text: "Sonia Sotomayor", isCorrect: false }
      ]),
      explanation: "John Roberts is the current Chief Justice of the United States.",
      isLocationSpecific: false
    },
    {
      questionNumber: 41,
      text: "Under our Constitution, some powers belong to the federal government. What is one power of the federal government?",
      correctAnswer: "to print money, to declare war, to create an army, to make treaties",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "to print money", isCorrect: true },
        { text: "to issue driver's licenses", isCorrect: false },
        { text: "to provide schooling", isCorrect: false },
        { text: "to provide police protection", isCorrect: false }
      ]),
      explanation: "The federal government has the power to print money, declare war, create an army, and make treaties, among other powers.",
      isLocationSpecific: false
    },
    {
      questionNumber: 42,
      text: "Under our Constitution, some powers belong to the states. What is one power of the states?",
      correctAnswer: "provide schooling and education, provide protection (police), provide safety (fire departments), give a driver's license, approve zoning and land use",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "provide schooling and education", isCorrect: true },
        { text: "print money", isCorrect: false },
        { text: "declare war", isCorrect: false },
        { text: "make treaties with foreign countries", isCorrect: false }
      ]),
      explanation: "State governments have the power to provide education, police protection, fire departments, driver's licenses, and approve zoning.",
      isLocationSpecific: false
    },
    {
      questionNumber: 45,
      text: "What are the two major political parties in the United States?",
      correctAnswer: "Democratic and Republican",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "Democratic and Republican", isCorrect: true },
        { text: "Conservative and Liberal", isCorrect: false },
        { text: "Green and Libertarian", isCorrect: false },
        { text: "Socialist and Constitution", isCorrect: false }
      ]),
      explanation: "The two major political parties in the United States are the Democratic Party and the Republican Party.",
      isLocationSpecific: false
    },
    {
      questionNumber: 46,
      text: "What is the political party of the President now?",
      correctAnswer: "Republican",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "Democratic", isCorrect: false },
        { text: "Republican", isCorrect: true },
        { text: "Libertarian", isCorrect: false },
        { text: "Independent", isCorrect: false }
      ]),
      explanation: "Donald Trump is a Republican, so the political party of the President is Republican.",
      isLocationSpecific: false
    },
    {
      questionNumber: 47,
      text: "What is the name of the Speaker of the House of Representatives now?",
      correctAnswer: "Mike Johnson",
      category: "AMERICAN GOVERNMENT",
      subcategory: "B: System of Government",
      options: createOptions([
        { text: "Mike Johnson", isCorrect: true },
        { text: "Nancy Pelosi", isCorrect: false },
        { text: "Kevin McCarthy", isCorrect: false },
        { text: "Chuck Schumer", isCorrect: false }
      ]),
      explanation: "Mike Johnson is the current Speaker of the House of Representatives.",
      isLocationSpecific: false
    },
    {
      questionNumber: 48,
      text: "There are four amendments to the Constitution about who can vote. Describe one of them.",
      correctAnswer: "Citizens eighteen (18) and older can vote. You don't have to pay a poll tax to vote. Any citizen can vote. Women and men can vote. A male citizen of any race can vote.",
      category: "AMERICAN GOVERNMENT",
      subcategory: "C: Rights and Responsibilities",
      options: createOptions([
        { text: "Citizens eighteen (18) and older can vote", isCorrect: true },
        { text: "You must own property to vote", isCorrect: false },
        { text: "Only men can vote", isCorrect: false },
        { text: "You must pay a fee to vote", isCorrect: false }
      ]),
      explanation: "The Constitution amendments that expanded voting rights include: 15th (race), 19th (women), 24th (no poll tax), and 26th (18+ can vote).",
      isLocationSpecific: false
    },
    {
      questionNumber: 49,
      text: "What is one responsibility that is only for United States citizens?",
      correctAnswer: "serve on a jury, vote in a federal election",
      category: "AMERICAN GOVERNMENT",
      subcategory: "C: Rights and Responsibilities",
      options: createOptions([
        { text: "serve on a jury", isCorrect: true },
        { text: "vote in a federal election", isCorrect: true },
        { text: "pay taxes", isCorrect: false },
        { text: "obey the law", isCorrect: false }
      ]),
      explanation: "Serving on a jury and voting in federal elections are responsibilities that are only for U.S. citizens.",
      isLocationSpecific: false
    },
    {
      questionNumber: 50,
      text: "Name one right only for United States citizens.",
      correctAnswer: "vote in a federal election, run for federal office",
      category: "AMERICAN GOVERNMENT",
      subcategory: "C: Rights and Responsibilities",
      options: createOptions([
        { text: "vote in a federal election", isCorrect: true },
        { text: "run for federal office", isCorrect: true },
        { text: "freedom of speech", isCorrect: false },
        { text: "freedom of religion", isCorrect: false }
      ]),
      explanation: "Rights only for U.S. citizens include voting in federal elections and running for federal office.",
      isLocationSpecific: false
    },
    {
      questionNumber: 51,
      text: "What are two rights of everyone living in the United States?",
      correctAnswer: "freedom of expression, freedom of speech, freedom of assembly, freedom to petition the government, freedom of religion, the right to bear arms",
      category: "AMERICAN GOVERNMENT",
      subcategory: "C: Rights and Responsibilities",
      options: createOptions([
        { text: "freedom of speech and freedom of religion", isCorrect: true },
        { text: "the right to vote and run for office", isCorrect: false },
        { text: "the right to healthcare and education", isCorrect: false },
        { text: "the right to citizenship and a passport", isCorrect: false }
      ]),
      explanation: "Rights for everyone in the U.S. include freedom of expression, speech, assembly, religion, and the right to bear arms.",
      isLocationSpecific: false
    },
    {
      questionNumber: 52,
      text: "What do we show loyalty to when we say the Pledge of Allegiance?",
      correctAnswer: "the United States, the flag",
      category: "AMERICAN GOVERNMENT",
      subcategory: "C: Rights and Responsibilities",
      options: createOptions([
        { text: "the United States", isCorrect: true },
        { text: "the flag", isCorrect: true },
        { text: "the President", isCorrect: false },
        { text: "the military", isCorrect: false }
      ]),
      explanation: "When saying the Pledge of Allegiance, we show loyalty to the United States and the flag.",
      isLocationSpecific: false
    },
    {
      questionNumber: 53,
      text: "What is one promise you make when you become a United States citizen?",
      correctAnswer: "give up loyalty to other countries, defend the Constitution and laws of the United States, obey the laws of the United States, serve in the U.S. military (if needed), serve the nation (if needed), be loyal to the United States",
      category: "AMERICAN GOVERNMENT",
      subcategory: "C: Rights and Responsibilities",
      options: createOptions([
        { text: "defend the Constitution and laws of the United States", isCorrect: true },
        { text: "never leave the United States", isCorrect: false },
        { text: "join a political party", isCorrect: false },
        { text: "change your name to an American name", isCorrect: false }
      ]),
      explanation: "When becoming a U.S. citizen, you promise to defend the Constitution, obey laws, and be loyal to the United States.",
      isLocationSpecific: false
    },
    {
      questionNumber: 54,
      text: "How old do citizens have to be to vote for President?",
      correctAnswer: "eighteen (18) and older",
      category: "AMERICAN GOVERNMENT",
      subcategory: "C: Rights and Responsibilities",
      options: createOptions([
        { text: "eighteen (18) and older", isCorrect: true },
        { text: "twenty-one (21) and older", isCorrect: false },
        { text: "sixteen (16) and older", isCorrect: false },
        { text: "twenty-five (25) and older", isCorrect: false }
      ]),
      explanation: "Citizens must be 18 years or older to vote for President.",
      isLocationSpecific: false
    },
    {
      questionNumber: 56,
      text: "When is the last day you can send in federal income tax forms?",
      correctAnswer: "April 15",
      category: "AMERICAN GOVERNMENT",
      subcategory: "C: Rights and Responsibilities",
      options: createOptions([
        { text: "April 15", isCorrect: true },
        { text: "December 31", isCorrect: false },
        { text: "January 31", isCorrect: false },
        { text: "May 1", isCorrect: false }
      ]),
      explanation: "Federal income tax forms must be filed by April 15.",
      isLocationSpecific: false
    },
    {
      questionNumber: 57,
      text: "When must all men register for the Selective Service?",
      correctAnswer: "at age eighteen (18), between eighteen (18) and twenty-six (26)",
      category: "AMERICAN GOVERNMENT",
      subcategory: "C: Rights and Responsibilities",
      options: createOptions([
        { text: "at age eighteen (18)", isCorrect: true },
        { text: "at age twenty-one (21)", isCorrect: false },
        { text: "at age sixteen (16)", isCorrect: false },
        { text: "at any age", isCorrect: false }
      ]),
      explanation: "Men must register for Selective Service at age 18 or between ages 18 and 26.",
      isLocationSpecific: false
    },
    {
      questionNumber: 58,
      text: "What is one reason colonists came to America?",
      correctAnswer: "freedom, political liberty, religious freedom, economic opportunity, to practice their religion, to escape persecution",
      category: "AMERICAN HISTORY",
      subcategory: "A: Colonial Period and Independence",
      options: createOptions([
        { text: "religious freedom", isCorrect: true },
        { text: "to create the United Nations", isCorrect: false },
        { text: "to avoid taxes", isCorrect: false },
        { text: "to build railroads", isCorrect: false }
      ]),
      explanation: "Colonists came to America for freedom, religious freedom, economic opportunity, and to escape persecution.",
      isLocationSpecific: false
    },
    {
      questionNumber: 59,
      text: "Who lived in America before the Europeans arrived?",
      correctAnswer: "American Indians, Native Americans",
      category: "AMERICAN HISTORY",
      subcategory: "A: Colonial Period and Independence",
      options: createOptions([
        { text: "American Indians", isCorrect: true },
        { text: "Native Americans", isCorrect: true },
        { text: "Pilgrims", isCorrect: false },
        { text: "Colonists", isCorrect: false }
      ]),
      explanation: "American Indians or Native Americans lived in America before Europeans arrived.",
      isLocationSpecific: false
    },
    {
      questionNumber: 60,
      text: "What group of people was taken to America and sold as slaves?",
      correctAnswer: "Africans, people from Africa",
      category: "AMERICAN HISTORY",
      subcategory: "A: Colonial Period and Independence",
      options: createOptions([
        { text: "Africans", isCorrect: true },
        { text: "European immigrants", isCorrect: false },
        { text: "Chinese laborers", isCorrect: false },
        { text: "Native Americans", isCorrect: false }
      ]),
      explanation: "Africans or people from Africa were taken to America and sold as slaves.",
      isLocationSpecific: false
    },
    {
      questionNumber: 61,
      text: "Why did the colonists fight the British?",
      correctAnswer: "because of high taxes (taxation without representation), because the British army stayed in their houses (boarding, quartering), because they didn't have self-government",
      category: "AMERICAN HISTORY",
      subcategory: "A: Colonial Period and Independence",
      options: createOptions([
        { text: "because of high taxes (taxation without representation)", isCorrect: true },
        { text: "to free the slaves", isCorrect: false },
        { text: "to create a monarchy", isCorrect: false },
        { text: "to join the European Union", isCorrect: false }
      ]),
      explanation: "The colonists fought the British because of high taxes, quartering of troops, and lack of self-government.",
      isLocationSpecific: false
    },
    {
      questionNumber: 62,
      text: "Who wrote the Declaration of Independence?",
      correctAnswer: "Thomas Jefferson",
      category: "AMERICAN HISTORY",
      subcategory: "A: Colonial Period and Independence",
      options: createOptions([
        { text: "Thomas Jefferson", isCorrect: true },
        { text: "George Washington", isCorrect: false },
        { text: "Abraham Lincoln", isCorrect: false },
        { text: "Benjamin Franklin", isCorrect: false }
      ]),
      explanation: "Thomas Jefferson wrote the Declaration of Independence.",
      isLocationSpecific: false
    },
    {
      questionNumber: 63,
      text: "When was the Declaration of Independence adopted?",
      correctAnswer: "July 4, 1776",
      category: "AMERICAN HISTORY",
      subcategory: "A: Colonial Period and Independence",
      options: createOptions([
        { text: "July 4, 1776", isCorrect: true },
        { text: "July 4, 1789", isCorrect: false },
        { text: "April 19, 1775", isCorrect: false },
        { text: "September 17, 1787", isCorrect: false }
      ]),
      explanation: "The Declaration of Independence was adopted on July 4, 1776.",
      isLocationSpecific: false
    },
    {
      questionNumber: 64,
      text: "There were 13 original states. Name three.",
      correctAnswer: "New Hampshire, Massachusetts, Rhode Island, Connecticut, New York, New Jersey, Pennsylvania, Delaware, Maryland, Virginia, North Carolina, South Carolina, Georgia",
      category: "AMERICAN HISTORY",
      subcategory: "A: Colonial Period and Independence",
      options: createOptions([
        { text: "Virginia, Massachusetts, and Pennsylvania", isCorrect: true },
        { text: "California, Texas, and Florida", isCorrect: false },
        { text: "Washington, Oregon, and Nevada", isCorrect: false },
        { text: "Alaska, Hawaii, and Puerto Rico", isCorrect: false }
      ]),
      explanation: "The 13 original states included New Hampshire, Massachusetts, Rhode Island, Connecticut, New York, New Jersey, Pennsylvania, Delaware, Maryland, Virginia, North Carolina, South Carolina, and Georgia.",
      isLocationSpecific: false
    },
    {
      questionNumber: 66,
      text: "When was the Constitution written?",
      correctAnswer: "1787",
      category: "AMERICAN HISTORY",
      subcategory: "A: Colonial Period and Independence",
      options: createOptions([
        { text: "1787", isCorrect: true },
        { text: "1776", isCorrect: false },
        { text: "1789", isCorrect: false },
        { text: "1800", isCorrect: false }
      ]),
      explanation: "The Constitution was written in 1787.",
      isLocationSpecific: false
    },
    {
      questionNumber: 67,
      text: "The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.",
      correctAnswer: "James Madison, Alexander Hamilton, John Jay, Publius",
      category: "AMERICAN HISTORY",
      subcategory: "A: Colonial Period and Independence",
      options: createOptions([
        { text: "James Madison", isCorrect: true },
        { text: "Alexander Hamilton", isCorrect: true },
        { text: "Thomas Jefferson", isCorrect: false },
        { text: "Benjamin Franklin", isCorrect: false }
      ]),
      explanation: "The Federalist Papers were written by James Madison, Alexander Hamilton, and John Jay (under the pseudonym Publius).",
      isLocationSpecific: false
    },
    {
      questionNumber: 68,
      text: "What is one thing Benjamin Franklin is famous for?",
      correctAnswer: "U.S. diplomat, oldest member of the Constitutional Convention, first Postmaster General of the United States, writer of 'Poor Richard's Almanac', started the first free libraries",
      category: "AMERICAN HISTORY",
      subcategory: "A: Colonial Period and Independence",
      options: createOptions([
        { text: "U.S. diplomat", isCorrect: true },
        { text: "first President", isCorrect: false },
        { text: "wrote the Declaration of Independence", isCorrect: false },
        { text: "invented the automobile", isCorrect: false }
      ]),
      explanation: "Benjamin Franklin is famous for being a U.S. diplomat, inventor, writer, and Constitutional Convention member.",
      isLocationSpecific: false
    },
    {
      questionNumber: 69,
      text: "Who is the 'Father of Our Country'?",
      correctAnswer: "George Washington",
      category: "AMERICAN HISTORY",
      subcategory: "B: 1800s",
      options: createOptions([
        { text: "George Washington", isCorrect: true },
        { text: "Thomas Jefferson", isCorrect: false },
        { text: "Abraham Lincoln", isCorrect: false },
        { text: "Benjamin Franklin", isCorrect: false }
      ]),
      explanation: "George Washington is known as the 'Father of Our Country.'",
      isLocationSpecific: false
    },
    {
      questionNumber: 71,
      text: "What territory did the United States buy from France in 1803?",
      correctAnswer: "the Louisiana Territory, Louisiana",
      category: "AMERICAN HISTORY",
      subcategory: "B: 1800s",
      options: createOptions([
        { text: "the Louisiana Territory", isCorrect: true },
        { text: "Alaska", isCorrect: false },
        { text: "Florida", isCorrect: false },
        { text: "Texas", isCorrect: false }
      ]),
      explanation: "The United States bought the Louisiana Territory from France in 1803.",
      isLocationSpecific: false
    },
    {
      questionNumber: 72,
      text: "Name one war fought by the United States in the 1800s.",
      correctAnswer: "War of 1812, Mexican-American War, Civil War, Spanish-American War",
      category: "AMERICAN HISTORY",
      subcategory: "B: 1800s",
      options: createOptions([
        { text: "Civil War", isCorrect: true },
        { text: "World War I", isCorrect: false },
        { text: "Revolutionary War", isCorrect: false },
        { text: "Vietnam War", isCorrect: false }
      ]),
      explanation: "Wars fought by the U.S. in the 1800s include the War of 1812, Mexican-American War, Civil War, and Spanish-American War.",
      isLocationSpecific: false
    },
    {
      questionNumber: 73,
      text: "Name the U.S. war between the North and the South.",
      correctAnswer: "the Civil War, the War between the States",
      category: "AMERICAN HISTORY",
      subcategory: "B: 1800s",
      options: createOptions([
        { text: "the Civil War", isCorrect: true },
        { text: "the War between the States", isCorrect: true },
        { text: "the Revolutionary War", isCorrect: false },
        { text: "the Spanish-American War", isCorrect: false }
      ]),
      explanation: "The U.S. war between the North and South was the Civil War, also called the War between the States.",
      isLocationSpecific: false
    },
    {
      questionNumber: 74,
      text: "Name one problem that led to the Civil War.",
      correctAnswer: "slavery, economic reasons, states' rights",
      category: "AMERICAN HISTORY",
      subcategory: "B: 1800s",
      options: createOptions([
        { text: "slavery", isCorrect: true },
        { text: "taxation", isCorrect: false },
        { text: "foreign policy", isCorrect: false },
        { text: "immigration", isCorrect: false }
      ]),
      explanation: "Problems that led to the Civil War included slavery, economic reasons, and states' rights.",
      isLocationSpecific: false
    },
    {
      questionNumber: 76,
      text: "What did the Emancipation Proclamation do?",
      correctAnswer: "freed the slaves, freed slaves in the Confederacy, freed slaves in the Confederate states, freed slaves in most Southern states",
      category: "AMERICAN HISTORY",
      subcategory: "B: 1800s",
      options: createOptions([
        { text: "freed the slaves in the Confederacy", isCorrect: true },
        { text: "ended the Civil War", isCorrect: false },
        { text: "gave women the right to vote", isCorrect: false },
        { text: "created the United States", isCorrect: false }
      ]),
      explanation: "The Emancipation Proclamation freed slaves in the Confederate states.",
      isLocationSpecific: false
    },
    {
      questionNumber: 77,
      text: "What did Susan B. Anthony do?",
      correctAnswer: "fought for women's rights, fought for civil rights",
      category: "AMERICAN HISTORY",
      subcategory: "B: 1800s",
      options: createOptions([
        { text: "fought for women's rights", isCorrect: true },
        { text: "was the first female President", isCorrect: false },
        { text: "invented the telephone", isCorrect: false },
        { text: "wrote the Declaration of Independence", isCorrect: false }
      ]),
      explanation: "Susan B. Anthony fought for women's rights and civil rights.",
      isLocationSpecific: false
    },
    {
      questionNumber: 78,
      text: "Name one war fought by the United States in the 1900s.",
      correctAnswer: "World War I, World War II, Korean War, Vietnam War, (Persian) Gulf War",
      category: "AMERICAN HISTORY",
      subcategory: "C: Recent American History and Other Important Historical Information",
      options: createOptions([
        { text: "World War II", isCorrect: true },
        { text: "Civil War", isCorrect: false },
        { text: "Revolutionary War", isCorrect: false },
        { text: "War of 1812", isCorrect: false }
      ]),
      explanation: "Wars fought by the U.S. in the 1900s include World War I, World War II, Korean War, Vietnam War, and Gulf War.",
      isLocationSpecific: false
    },
    {
      questionNumber: 79,
      text: "Who was President during World War I?",
      correctAnswer: "Woodrow Wilson",
      category: "AMERICAN HISTORY",
      subcategory: "C: Recent American History and Other Important Historical Information",
      options: createOptions([
        { text: "Woodrow Wilson", isCorrect: true },
        { text: "Franklin D. Roosevelt", isCorrect: false },
        { text: "Theodore Roosevelt", isCorrect: false },
        { text: "Harry S. Truman", isCorrect: false }
      ]),
      explanation: "Woodrow Wilson was President during World War I.",
      isLocationSpecific: false
    },
    {
      questionNumber: 80,
      text: "Who was President during the Great Depression and World War II?",
      correctAnswer: "Franklin Roosevelt",
      category: "AMERICAN HISTORY",
      subcategory: "C: Recent American History and Other Important Historical Information",
      options: createOptions([
        { text: "Franklin Roosevelt", isCorrect: true },
        { text: "Herbert Hoover", isCorrect: false },
        { text: "Harry S. Truman", isCorrect: false },
        { text: "Dwight D. Eisenhower", isCorrect: false }
      ]),
      explanation: "Franklin Roosevelt was President during both the Great Depression and World War II.",
      isLocationSpecific: false
    },
    {
      questionNumber: 81,
      text: "Who did the United States fight in World War II?",
      correctAnswer: "Japan, Germany, and Italy",
      category: "AMERICAN HISTORY",
      subcategory: "C: Recent American History and Other Important Historical Information",
      options: createOptions([
        { text: "Japan, Germany, and Italy", isCorrect: true },
        { text: "Soviet Union, China, and North Korea", isCorrect: false },
        { text: "Vietnam, Cambodia, and Laos", isCorrect: false },
        { text: "Great Britain, France, and Spain", isCorrect: false }
      ]),
      explanation: "The United States fought Japan, Germany, and Italy in World War II.",
      isLocationSpecific: false
    },
    {
      questionNumber: 82,
      text: "Before he was President, Eisenhower was a general. What war was he in?",
      correctAnswer: "World War II",
      category: "AMERICAN HISTORY",
      subcategory: "C: Recent American History and Other Important Historical Information",
      options: createOptions([
        { text: "World War II", isCorrect: true },
        { text: "World War I", isCorrect: false },
        { text: "Korean War", isCorrect: false },
        { text: "Vietnam War", isCorrect: false }
      ]),
      explanation: "Before becoming President, Eisenhower was a general in World War II.",
      isLocationSpecific: false
    },
    {
      questionNumber: 83,
      text: "During the Cold War, what was the main concern of the United States?",
      correctAnswer: "Communism",
      category: "AMERICAN HISTORY",
      subcategory: "C: Recent American History and Other Important Historical Information",
      options: createOptions([
        { text: "Communism", isCorrect: true },
        { text: "Fascism", isCorrect: false },
        { text: "Terrorism", isCorrect: false },
        { text: "Economic depression", isCorrect: false }
      ]),
      explanation: "During the Cold War, the main concern of the United States was Communism.",
      isLocationSpecific: false
    },
    {
      questionNumber: 85,
      text: "What did Martin Luther King, Jr. do?",
      correctAnswer: "fought for civil rights, worked for equality for all Americans",
      category: "AMERICAN HISTORY",
      subcategory: "C: Recent American History and Other Important Historical Information",
      options: createOptions([
        { text: "fought for civil rights", isCorrect: true },
        { text: "became the first Black President", isCorrect: false },
        { text: "invented the internet", isCorrect: false },
        { text: "discovered America", isCorrect: false }
      ]),
      explanation: "Martin Luther King, Jr. fought for civil rights and worked for equality for all Americans.",
      isLocationSpecific: false
    },
    {
      questionNumber: 86,
      text: "What major event happened on September 11, 2001, in the United States?",
      correctAnswer: "Terrorists attacked the United States",
      category: "AMERICAN HISTORY",
      subcategory: "C: Recent American History and Other Important Historical Information",
      options: createOptions([
        { text: "Terrorists attacked the United States", isCorrect: true },
        { text: "The U.S. declared independence", isCorrect: false },
        { text: "The Civil War began", isCorrect: false },
        { text: "The Constitution was signed", isCorrect: false }
      ]),
      explanation: "On September 11, 2001, terrorists attacked the United States.",
      isLocationSpecific: false
    },
    {
      questionNumber: 87,
      text: "Name one American Indian tribe in the United States.",
      correctAnswer: "Cherokee, Navajo, Sioux, Chippewa, Choctaw, Pueblo, Apache, Iroquois, Creek, Blackfeet, Seminole, Cheyenne, Arawak, Shawnee, Mohegan, Huron, Oneida, Lakota, Crow, Teton, Hopi, Inuit",
      category: "AMERICAN HISTORY",
      subcategory: "C: Recent American History and Other Important Historical Information",
      options: createOptions([
        { text: "Cherokee", isCorrect: true },
        { text: "Navajo", isCorrect: true },
        { text: "Maya", isCorrect: false },
        { text: "Incan", isCorrect: false }
      ]),
      explanation: "American Indian tribes in the United States include Cherokee, Navajo, Sioux, Chippewa, and many others.",
      isLocationSpecific: false
    },
    {
      questionNumber: 88,
      text: "Name one of the two longest rivers in the United States.",
      correctAnswer: "Missouri (River), Mississippi (River)",
      category: "INTEGRATED CIVICS",
      subcategory: "A: Geography",
      options: createOptions([
        { text: "Mississippi River", isCorrect: true },
        { text: "Missouri River", isCorrect: true },
        { text: "Colorado River", isCorrect: false },
        { text: "Rio Grande", isCorrect: false }
      ]),
      explanation: "The Missouri River and Mississippi River are the two longest rivers in the United States.",
      isLocationSpecific: false
    },
    {
      questionNumber: 89,
      text: "What ocean is on the West Coast of the United States?",
      correctAnswer: "Pacific (Ocean)",
      category: "INTEGRATED CIVICS",
      subcategory: "A: Geography",
      options: createOptions([
        { text: "Pacific Ocean", isCorrect: true },
        { text: "Atlantic Ocean", isCorrect: false },
        { text: "Indian Ocean", isCorrect: false },
        { text: "Arctic Ocean", isCorrect: false }
      ]),
      explanation: "The Pacific Ocean is on the West Coast of the United States.",
      isLocationSpecific: false
    },
    {
      questionNumber: 90,
      text: "What ocean is on the East Coast of the United States?",
      correctAnswer: "Atlantic (Ocean)",
      category: "INTEGRATED CIVICS",
      subcategory: "A: Geography",
      options: createOptions([
        { text: "Atlantic Ocean", isCorrect: true },
        { text: "Pacific Ocean", isCorrect: false },
        { text: "Indian Ocean", isCorrect: false },
        { text: "Arctic Ocean", isCorrect: false }
      ]),
      explanation: "The Atlantic Ocean is on the East Coast of the United States.",
      isLocationSpecific: false
    },
    {
      questionNumber: 92,
      text: "Name one state that borders Canada.",
      correctAnswer: "Maine, New Hampshire, Vermont, New York, Pennsylvania, Ohio, Michigan, Minnesota, North Dakota, Montana, Idaho, Washington, Alaska",
      category: "INTEGRATED CIVICS",
      subcategory: "A: Geography",
      options: createOptions([
        { text: "Maine", isCorrect: true },
        { text: "California", isCorrect: false },
        { text: "Texas", isCorrect: false },
        { text: "Florida", isCorrect: false }
      ]),
      explanation: "States that border Canada include Maine, New Hampshire, Vermont, New York, Pennsylvania, Ohio, Michigan, Minnesota, North Dakota, Montana, Idaho, Washington, and Alaska.",
      isLocationSpecific: false
    },
    {
      questionNumber: 93,
      text: "Name one state that borders Mexico.",
      correctAnswer: "California, Arizona, New Mexico, Texas",
      category: "INTEGRATED CIVICS",
      subcategory: "A: Geography",
      options: createOptions([
        { text: "California", isCorrect: true },
        { text: "Florida", isCorrect: false },
        { text: "Nevada", isCorrect: false },
        { text: "Louisiana", isCorrect: false }
      ]),
      explanation: "States that border Mexico include California, Arizona, New Mexico, and Texas.",
      isLocationSpecific: false
    },
    {
      questionNumber: 94,
      text: "What is the capital of the United States?",
      correctAnswer: "Washington, D.C.",
      category: "INTEGRATED CIVICS",
      subcategory: "A: Geography",
      options: createOptions([
        { text: "Washington, D.C.", isCorrect: true },
        { text: "New York City", isCorrect: false },
        { text: "Boston", isCorrect: false },
        { text: "Philadelphia", isCorrect: false }
      ]),
      explanation: "Washington, D.C. is the capital of the United States.",
      isLocationSpecific: false
    },
    {
      questionNumber: 95,
      text: "Where is the Statue of Liberty?",
      correctAnswer: "New York (Harbor), Liberty Island [Also acceptable are New Jersey, near New York City, and on the Hudson (River)]",
      category: "INTEGRATED CIVICS",
      subcategory: "B: Symbols",
      options: createOptions([
        { text: "New York Harbor", isCorrect: true },
        { text: "Washington, D.C.", isCorrect: false },
        { text: "Boston", isCorrect: false },
        { text: "Philadelphia", isCorrect: false }
      ]),
      explanation: "The Statue of Liberty is in New York Harbor, on Liberty Island.",
      isLocationSpecific: false
    },
    {
      questionNumber: 97,
      text: "Why does the flag have 50 stars?",
      correctAnswer: "because there is one star for each state, because each star represents a state, because there are 50 states",
      category: "INTEGRATED CIVICS",
      subcategory: "B: Symbols",
      options: createOptions([
        { text: "because there is one star for each state", isCorrect: true },
        { text: "because there is one star for each President", isCorrect: false },
        { text: "because there is one star for each amendment", isCorrect: false },
        { text: "because there is one star for each year of independence", isCorrect: false }
      ]),
      explanation: "The flag has 50 stars because there is one star for each state.",
      isLocationSpecific: false
    },
    {
      questionNumber: 98,
      text: "What is the name of the national anthem?",
      correctAnswer: "The Star-Spangled Banner",
      category: "INTEGRATED CIVICS",
      subcategory: "C: Holidays",
      options: createOptions([
        { text: "The Star-Spangled Banner", isCorrect: true },
        { text: "America the Beautiful", isCorrect: false },
        { text: "God Bless America", isCorrect: false },
        { text: "My Country 'Tis of Thee", isCorrect: false }
      ]),
      explanation: "The national anthem of the United States is The Star-Spangled Banner.",
      isLocationSpecific: false
    },
    {
      questionNumber: 99,
      text: "When do we celebrate Independence Day?",
      correctAnswer: "July 4",
      category: "INTEGRATED CIVICS",
      subcategory: "C: Holidays",
      options: createOptions([
        { text: "July 4", isCorrect: true },
        { text: "June 14", isCorrect: false },
        { text: "May 30", isCorrect: false },
        { text: "September 17", isCorrect: false }
      ]),
      explanation: "We celebrate Independence Day on July 4.",
      isLocationSpecific: false
    },
    {
      questionNumber: 100,
      text: "Name two national U.S. holidays.",
      correctAnswer: "New Year's Day, Martin Luther King Jr. Day, Presidents' Day, Memorial Day, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, Christmas",
      category: "INTEGRATED CIVICS",
      subcategory: "C: Holidays",
      options: createOptions([
        { text: "Independence Day and Thanksgiving", isCorrect: true },
        { text: "Valentine's Day and Halloween", isCorrect: false },
        { text: "Easter and St. Patrick's Day", isCorrect: false },
        { text: "Arbor Day and Flag Day", isCorrect: false }
      ]),
      explanation: "National U.S. holidays include New Year's Day, MLK Day, Presidents' Day, Memorial Day, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, and Christmas.",
      isLocationSpecific: false
    }
  ];

  // Combine the questions data
  const allQuestions = [...questionsData, ...sampleQuestions];

  // Insert all questions into the database
  for (const question of allQuestions) {
    await storage.createQuestion(question);
  }
}

// Helper function to create question options with IDs
function createOptions(options: { text: string; isCorrect: boolean }[]): QuestionOption[] {
  // Shuffle the options to randomize their order
  const shuffledOptions = shuffleArray([...options]);
  
  return shuffledOptions.map((option, index) => ({
    id: `option_${index + 1}`,
    text: option.text,
    isCorrect: option.isCorrect
  }));
}

// Utility function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
