import os
import requests
import PyPDF2
import openai
import json

# Set your OpenAI API key
openai.api_key = "******************************"

# Set the model name for fine-tuning
MODEL_NAME = "davinci"

# Function to convert text to JSONL format
def convert_to_jsonl(text):
    lines = text.split('\n')

    jsonl_data = []
    for i in range(0, len(lines), 2):
        if i+1 < len(lines):
            prompt = lines[i].strip()
            completion = lines[i+1].strip()
            data = {'prompt': prompt, 'completion': completion}
            jsonl_data.append(json.dumps(data))

    return jsonl_data

# Function to convert PDF to text
def pdf_to_text(file_path):
    text = ''
    with open(file_path, 'rb') as file:
        try:
            # Read the PDF file using PyPDF2
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)

            # Extract text from each page
            for page_number in range(num_pages):
                page = pdf_reader.pages[page_number]
                text += page.extract_text()
        except Exception:
            # Handle exceptions when reading PDF files
            print(f'Error reading PDF: {file_path}')

    return convert_to_jsonl(text)

# Function to upload a file using the OpenAI API
def upload_file(file_path):
    response = openai.File.create(
        file=open(file_path, "rb"),
        purpose='fine-tune'
        )
    print(response)
    file_id = response['id']
    return file_id

# Function to fine-tune the model on a file
def fine_tune_model(file_id):
   
    response = openai.FineTune.create(training_file=file_id, model=MODEL_NAME, n_epochs =4)
    print(response)
    fine_tuned_output = response["id"]
    return fine_tuned_output

# Directory containing the PDF files
pdf_directory = "cases"

# Process PDF files and upload for fine-tuning
for file_name in os.listdir(pdf_directory):
    if file_name.endswith(".pdf"):
        file_path = os.path.join(pdf_directory, file_name)
        text = pdf_to_text(file_path)
        print(text)
        # Save the JSONL data to a file
        output_file_path = 'cases/output.jsonl'
        with open(output_file_path, 'w') as file:
            file.write('\n'.join(text))

        print("Conversion to JSONL format completed.")
        file_id = upload_file(output_file_path)
        fine_tuned_output_id = fine_tune_model(file_id)

        print(f"File '{file_name}' uploaded and fine-tuned. Output ID: {fine_tuned_output_id}")
