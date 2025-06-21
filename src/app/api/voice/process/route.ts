import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { audioData, sessionId, clientId, duration } = await request.json();

    // Mock processing for now - in real implementation would use:
    // 1. Speech-to-text service (Vapi, OpenAI Whisper, etc.)
    // 2. Claude for task extraction and analysis
    // 3. Gemini for case note generation

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock transcription result
    const mockTranscription = "Just left my meeting with Jane Doe. She seems to be in good spirits but mentioned her housing application is still pending. We need to follow up with the housing authority by Friday. I've scheduled a check-in call for her on Wednesday at 2 PM. She also asked about job training programs, so I'll need to research available options in her area.";

    // Mock AI analysis
    const mockAnalysis = {
      tasks: [
        {
          title: "Follow up with housing authority",
          description: "Check status of Jane's housing application",
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          priority: "high" as const,
          task_type: "follow_up" as const
        },
        {
          title: "Schedule check-in call", 
          description: "Weekly check-in call with client",
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          priority: "medium" as const,
          task_type: "appointment" as const
        },
        {
          title: "Research job training programs",
          description: "Find available job training options in client's area",
          priority: "medium" as const,
          task_type: "follow_up" as const
        }
      ],
      summary: "Client visit completed. Jane is showing positive mood and engagement. Primary concerns center around pending housing application status. Additional support needed for employment opportunities through job training programs.",
      mood_assessment: "Positive - client appears engaged and motivated despite housing concerns",
      next_steps: [
        "Contact housing authority for application update",
        "Schedule Wednesday check-in call",
        "Compile job training resources for client"
      ]
    };

    // In real implementation, save to database here
    console.log('Processing voice session:', {
      sessionId,
      clientId,
      duration,
      transcription: mockTranscription.substring(0, 100) + '...'
    });

    return NextResponse.json({
      success: true,
      transcription: mockTranscription,
      analysis: mockAnalysis
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process voice recording' },
      { status: 500 }
    );
  }
} 