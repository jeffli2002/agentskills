import asyncio
import edge_tts
import os

OUTPUT_DIR = "D:/AI/agentskills/apps/promo-video/public/audio"

# Voice options: en-US-GuyNeural (male), en-US-JennyNeural (female), en-US-AriaNeural (female)
# en-GB-SoniaNeural (British female), en-US-ChristopherNeural (male)
VOICE = "en-US-GuyNeural"  # Professional male voice

# Scene scripts with timing consideration
SCRIPTS = [
    ("01-intro", "Agent Skills Marketplace"),
    ("02-hero", "Discover and create the best AI agent skills."),
    ("03-browse", "Browse skills by category."),
    ("04-create", "Create your own skills with AI. Simply describe what you need in natural language."),
    ("05-questions", "Our AI asks clarifying questions to understand exactly what you're looking for."),
    ("06-workflow", "Watch as our intelligent workflow analyzes your request, searches similar skills, builds the structure, and generates your content."),
    ("07-generate", "Your skill dot MD file is generated in real time, with complete documentation."),
    ("08-publish", "Skill published! Your creation is now live on the marketplace, ready to download and share."),
    ("09-myskills", "Build your collection of powerful AI skills. Track downloads, ratings, and grow your developer portfolio."),
    ("10-outro", "Agent Skills. Start building your skills today."),
]

async def generate_audio(text: str, output_file: str):
    """Generate audio file from text using edge-tts"""
    communicate = edge_tts.Communicate(text, VOICE, rate="-5%", pitch="+0Hz")
    await communicate.save(output_file)
    print(f"Generated: {output_file}")

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for filename, script in SCRIPTS:
        output_path = os.path.join(OUTPUT_DIR, f"{filename}.mp3")
        await generate_audio(script, output_path)

    print("\nAll voice files generated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
