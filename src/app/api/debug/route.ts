import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Simple security check
  if (secret !== 'tsukodebug123') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const report: any = {};

  try {
    report.currentDir = process.cwd();
    
    // Check Git status & latest commit
    try {
      report.gitCommit = execSync('git log -n 3 --oneline', { encoding: 'utf8' }).trim().split('\n');
      report.gitStatus = execSync('git status', { encoding: 'utf8' }).trim().split('\n');
    } catch (err: any) {
      report.gitError = err.message;
    }

    // Check directory contents
    try {
      report.files = fs.readdirSync(process.cwd());
      report.nextDirExists = fs.existsSync(path.join(process.cwd(), '.next'));
      if (report.nextDirExists) {
        report.nextFiles = fs.readdirSync(path.join(process.cwd(), '.next')).slice(0, 10);
        const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID');
        report.hasBuildId = fs.existsSync(buildIdPath);
        if (report.hasBuildId) {
          report.buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
        }
      }
    } catch (err: any) {
      report.filesError = err.message;
    }

    // Check force-build.txt and server.js
    report.forceBuildExists = fs.existsSync(path.join(process.cwd(), 'force-build.txt'));
    report.serverJsExists = fs.existsSync(path.join(process.cwd(), 'server.js'));
    if (report.serverJsExists) {
      const serverJsContent = fs.readFileSync(path.join(process.cwd(), 'server.js'), 'utf8');
      report.serverJsHasForceBuild = serverJsContent.includes('forceBuild');
      report.serverJsSnippet = serverJsContent.substring(0, 300);
    }

    // Prisma DB Connection Check
    try {
      const { prisma } = await import('@/shared/lib/prisma');
      const testCount = await prisma.user.count();
      report.databaseConnection = 'SUCCESS';
      report.databaseUserCount = testCount;
    } catch (dbErr: any) {
      report.databaseConnection = 'FAILED';
      report.databaseError = dbErr.message;
    }

    // Check important environment variables (without revealing their actual secrets)
    report.envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? (process.env.DATABASE_URL.includes('veritabani_kullanicisi') ? 'PLACEHOLDER' : 'CONFIGURED') : 'MISSING',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? (process.env.GOOGLE_CLIENT_ID.includes('mock_') ? 'PLACEHOLDER' : 'CONFIGURED') : 'MISSING',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? (process.env.GOOGLE_CLIENT_SECRET.includes('mock_') ? 'PLACEHOLDER' : 'CONFIGURED') : 'MISSING',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? (process.env.NEXTAUTH_SECRET.includes('auth_key_') ? 'PLACEHOLDER' : 'CONFIGURED') : 'MISSING',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
      REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN ? 'CONFIGURED' : 'MISSING',
      SMTP_PASS: process.env.SMTP_PASS ? (process.env.SMTP_PASS.includes('email_password') ? 'PLACEHOLDER' : 'CONFIGURED') : 'MISSING',
      SHOPIER_API_SECRET: process.env.SHOPIER_API_SECRET ? 'CONFIGURED' : 'MISSING',
    };

    // Read stderr.log if exists
    try {
      const logPath = path.join(process.cwd(), 'stderr.log');
      if (fs.existsSync(logPath)) {
        const logContent = fs.readFileSync(logPath, 'utf8');
        report.stderrLog = logContent.split('\n').slice(-25).join('\n'); // Last 25 lines
      } else {
        report.stderrLog = 'No stderr.log found';
      }
    } catch (err: any) {
      report.stderrLog = 'Error reading log: ' + err.message;
    }

    // Node & Environment info
    report.nodeVersion = process.version;
    report.env = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    };

  } catch (globalErr: any) {
    report.globalError = globalErr.message;
  }

  return NextResponse.json(report);
}

