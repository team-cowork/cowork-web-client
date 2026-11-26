import axios from 'axios';

import { postTeamIconConfirm } from '@/entities/team/api/post-team-icon-confirm';
import { postTeamIconPresigned } from '@/entities/team/api/post-team-icon-presigned';
import { withDevCredential } from '@/shared/api/dev-credential';

export async function uploadTeamIcon(
  teamId: number,
  file: File,
): Promise<string> {
  const { objectKey, uploadUrl } = await postTeamIconPresigned(
    teamId,
    file.type,
  );

  await axios.put(withDevCredential(uploadUrl), file, {
    headers: { 'Content-Type': file.type },
  });

  const { iconUrl } = await postTeamIconConfirm(objectKey);

  return iconUrl;
}
