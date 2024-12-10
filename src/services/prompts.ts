export const ANALYSIS_PROMPT = `Analyze this position and provide details for hiring in the Philippines:

Position Details:
- Job Title: {jobTitle}
- Required Skills: {skills}
- Experience Level: {experienceLevel}
- Education Level: {educationLevel}
- Employment Type: {employmentType}
- Onshore Location: {location}

Please provide:
1. A professional job description that does not mention any client names, with clear formatting and emphasis on key points
2. Estimated talent pool size in the Philippines for this specific role
3. Salary ranges (both onshore in {location} and in the Philippines)
4. Data sources with direct links to specific content

Format the response in JSON with the following structure:
{
  "jobDescription": {
    "overview": "string with HTML formatting for emphasis",
    "responsibilities": ["string with HTML formatting"],
    "requirements": ["string with HTML formatting"],
    "benefits": ["string with HTML formatting"]
  },
  "talentPoolSize": number,
  "onshoreSalaryRange": {
    "min": number,
    "max": number
  },
  "offshoreSalaryRange": {
    "min": number,
    "max": number
  },
  "sources": [
    {
      "name": "string",
      "url": "string (direct link to specific content)"
    }
  ]
}

Important Guidelines:
- Use HTML formatting for better readability:
  * <strong> for important terms and requirements
  * <em> for emphasis
  * <ul>/<li> for lists
  * <p> for paragraphs
- Make the job description engaging and candidate-focused
- Highlight key technologies and skills in bold
- Include specific achievements or metrics where relevant
- Do not mention any client names
- Ensure all salary figures are annual in USD
- Provide specific, direct URLs for sources
- Focus on the Philippines talent market
- Format benefits as attractive bullet points`;

export const SKILLS_SUGGESTION_PROMPT = `For the position of {jobTitle}, suggest:
1. 5 categories of relevant skills with 4-5 skills each
2. Experience levels
3. Education levels

Current skills: {currentSkills}
Current experience level: {experienceLevel}
Current education level: {educationLevel}

Format as JSON with:
{
  "categories": [
    {
      "name": "string",
      "skills": ["string"]
    }
  ],
  "experienceLevels": ["string"],
  "educationLevels": ["string"]
}

Important:
- Focus on current industry-standard skills
- Include both technical and soft skills
- Ensure skills are specific and measurable
- Group skills by logical categories
- Include emerging technologies where relevant`;