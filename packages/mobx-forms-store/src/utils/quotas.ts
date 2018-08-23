
let isReached;

export function isQuotaReached(): boolean {
  return isReached;
}
function _isQuotaReached(): Promise<Boolean> {
  let n = navigator as any;
  if (n.webkitTemporaryStorage && n.webkitTemporaryStorage.queryUsageAndQuota) {
    return new Promise((resolve, reject) => {
      n.webkitTemporaryStorage.queryUsageAndQuota(
        function (usedBytes, grantedBytes) {
          resolve(usedBytes == grantedBytes);
        },
        function (e) {
          console.log("error", e);
          resolve(false);
        }
      )
    });
  }
};

export async function calcQuotaReached(): Promise<Boolean> {
  isReached = await _isQuotaReached();
  return isReached;
}
